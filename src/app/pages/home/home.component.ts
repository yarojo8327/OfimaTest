import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RestClientService } from '../../services/rest-client.service';
import { globalConstant } from '../../services/global-constant';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private restClient: RestClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  createForm() {
    this.form = this.fb.group({
      playerOne: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(30),
        ],
      ],
      playerTwo: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(30),
        ],
      ],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('form submitted');
      var form = this.form;
      this.registerPlayers();
    } else {
      this.form.reset();
      return;
    }
  }

  private registerPlayers(): void {
    this.restClient
      .post(globalConstant.registerPlayer, this.form.value)
      .subscribe(
        (res: any) => {
          localStorage.setItem('players', JSON.stringify(res.data));
          this.router.navigate([`../game`], { relativeTo: this.route });
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
}
