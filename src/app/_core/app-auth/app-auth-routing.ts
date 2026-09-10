import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthLoginComponent } from './page/auth-login/auth-login.component'

export const routes: Routes = [

    {
        path: '',
        component: AuthLoginComponent,
        data: { title: 'Dashboard Pathox' },
    }


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppAuthRoutingModule { }