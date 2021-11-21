import { Component, OnInit } from '@angular/core';
import { Router, Event as NavigationEvent, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit {

  routeName?: string;
  _subscription;

  constructor(private router: Router) {
    this._subscription = router.events.subscribe((e:NavigationEvent) => {
      if (e instanceof NavigationStart) {
        const url = e.url.substring(1);
        this.routeName = url === 'home' ? '' : url;
      }
    });
   }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
