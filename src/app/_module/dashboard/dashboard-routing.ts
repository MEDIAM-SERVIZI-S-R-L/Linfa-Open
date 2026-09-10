import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IndexComponent}  from './page/index/index.component'
export const routes: Routes = [

            {
                path: '',
                component: IndexComponent,
                data: { title: 'Dashboard Pathox' },
               // canActivate: [AuthGuard],
            }


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
