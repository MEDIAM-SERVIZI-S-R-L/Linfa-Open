import { Component, OnInit, ViewChild } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ChartData as Stats, TabStats } from 'src/app/_models/statistiche'
import { StatisticheService } from 'src/app/_repositories/statistiche_repo.service'
import { ChartConfiguration, ChartType } from 'chart.js'

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements OnInit {
  dataset = []

  tabsWidgetsStats: TabStats[]
  //barChartType: ChartType = 'pie';
  constructor(private httpStats: StatisticheService) {
    //  this.tabsWidgetsStats[0].widgets[0].
  }

  ngOnInit() {
    this.generateTabWidgets()
  }

  async generateTabWidgets() {
    this.tabsWidgetsStats = await firstValueFrom(this.httpStats.getTabsWidgets());
    console.log(this.tabsWidgetsStats);
    
  }




  public barChartType: ChartType = 'line'
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      x: {},

    },
    plugins: {
      legend: {
        display: true,
      },
    },
  }
}
