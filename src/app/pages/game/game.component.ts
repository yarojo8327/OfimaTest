import { Component, OnInit } from '@angular/core';
import { Player } from '../../models/player';
import { RestClientService } from 'src/app/services/rest-client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { globalConstant } from 'src/app/services/global-constant';
import { Game } from 'src/app/models/games';
import { Round } from 'src/app/models/round';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  public players: Player[] = [];
  public rounds: any[] = [];
  public playerOne: Player;
  public playerTwo: Player;
  public roundNumber: number = 1;
  public disabledPlayerTwo: boolean = true;
  public completedRond: boolean = false;
  public registedGame: boolean = false;
  public gameId: number;
  public winnerMessage: string = '';
  public scorePlayerOne: number = 0;
  public scorePlayerTwo: number = 0;
  public finishGame: boolean = false;

  constructor(private restClient: RestClientService,  private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    let strPlayers: string = localStorage.getItem('players')!;
    if (strPlayers !== undefined && strPlayers !== '') {
      this.players = JSON.parse(strPlayers);
      this.playerOne = this.players[0];
      this.playerTwo = this.players[1];
      if (!this.registedGame) {
        this.registerGame();
      }
    }
  }

  ngOnDestroy(): void {
    localStorage.clear();
  }

  public setMovePlayer(playerId: number, moveId: number): void {
    const move = {
      gameId: this.gameId,
      playerId: this.disabledPlayerTwo ? this.playerOne.id : this.playerTwo.id,
      moveId: moveId,
      roundNumber: this.roundNumber,
    };
    this.registerMove(move);
  }

  public newGame(): void {
    this.confirmBox();
  }

  public resetGame(): void {
    this.rounds = [];
    this.roundNumber = 1;
    this.disabledPlayerTwo = true;
    this.completedRond = false;
    this.registedGame = false;
    this.winnerMessage = '';
    this.scorePlayerOne = 0;
    this.scorePlayerTwo = 0;
    this.finishGame = false;
    this.registerGame();
  }

  private registerMove(move: any): void {
    this.restClient.post(globalConstant.moves, move).subscribe(
      (res: any) => {
        if (res.isSuccess) {
          debugger;
          if (!this.disabledPlayerTwo) {
            this.completedRond = true;
          } else {
            this.disabledPlayerTwo = !this.disabledPlayerTwo;
          }
        }

        if (this.completedRond) {
          this.getWinner();
          this.disabledPlayerTwo = !this.disabledPlayerTwo;
          this.roundNumber = this.roundNumber + 1;
          this.completedRond = false;
          this.registedGame = false;
        }
      },
      (error: any) => {}
    );
  }

  private registerGame(): void {
    const gameRequest = {
      playerOneId: this.playerOne.id,
      playerTwoId: this.playerTwo.id,
    };

    this.restClient.post(globalConstant.games, gameRequest).subscribe(
      (res: any) => {
        if (res.isSuccess) {
          this.gameId = res.data.gameId;
          this.registedGame = true;
        } else {
          //error
        }
      },
      (error: any) => {
        debugger;
        Swal.fire({
          title: 'Oops...',
          icon: 'error',
          html: error.error.message,
          showCloseButton: false,
          showCancelButton: false,
          focusConfirm: false,
          confirmButtonText: 'Aceptar',
        });
      }
    );
  }

  private getWinner(): void {
    this.restClient
      .getById(
        `${globalConstant.games}/Winner/${this.gameId}/Round`,
        this.roundNumber
      )
      .subscribe(
        (res: any) => {
          if (res.isSuccess) {
            this.rounds.push({
              playerOne: res.data.movePlayerOne,
              playerTwo: res.data.movePlayerTwo,
              winner: res.data.winner,
            });
            this.setScore(res.data);
            this.validateScores();
            this.winnerMessage = res.message;
          }
        },
        (error: any) => {
          Swal.fire({
            title: 'Oops...',
            icon: 'error',
            html: error.error.message,
            showCloseButton: false,
            showCancelButton: false,
            focusConfirm: false,
            confirmButtonText: 'Aceptar',
          });
        }
      );
  }

  private setScore(round: any): void {
    if (round.winnerId == null) {
      return;
    }

    if (round.winnerId == this.playerOne.id) {
      this.scorePlayerOne = this.scorePlayerOne + 1;
    } else {
      this.scorePlayerTwo = this.scorePlayerTwo + 1;
    }
  }

  private validateScores(): void {
    let message: string = '';
    let winnerId: number = 0;
    if (this.scorePlayerOne == 3) {
      message = `El Ganador es: ${this.playerOne.names}`;
      (winnerId = this.playerOne.id), (this.finishGame = true);
      Swal.fire({
        title: 'Felicidades...',
        icon: 'success',
        html: message,
        showCloseButton: false,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: 'Aceptar',
      });
    } else {
      if (this.scorePlayerTwo == 3) {
        message = `${this.playerTwo.names} ha ganado la partida`;
        (winnerId = this.playerOne.id), (this.finishGame = true);
        Swal.fire({
          title: 'Felicidades...',
          icon: 'success',
          html: message,
          showCloseButton: false,
          showCancelButton: false,
          focusConfirm: false,
          confirmButtonText: 'Aceptar',
        });
      }
    }

    if (this.finishGame) {
      this.setWinner(winnerId);
    }
  }

  private setWinner(winnerId: any): void {
    const request = {
      id: this.gameId,
      playerOneId: this.playerOne.id,
      playerTwoId: this.playerTwo.id,
      winnerId: winnerId,
    };

    this.restClient.put(globalConstant.games, request).subscribe(
      (res: any) => {},
      (error: any) => {
        Swal.fire({
          title: 'Oops...',
          icon: 'error',
          html: error.error.message,
          showCloseButton: false,
          showCancelButton: false,
          focusConfirm: false,
          confirmButtonText: 'Aceptar',
        });
      }
    );
  }

  confirmBox() {
    Swal.fire({
      title: 'Esta seguro que desea iniciar un nevo juego?',
      text: 'Debera voy a registrar los jugadores',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, Un nuevo juego',
      cancelButtonText: 'No, Iniciar nueva ronda',
    }).then((result) => {
      if (result.value) {
        localStorage.clear();
        this.router.navigate([`../home`], { relativeTo: this.route });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.resetGame();
      }
    });
  }
}
