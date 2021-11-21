import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepoService } from '../repo.service';
import { OrgItem } from '../_models/OrgItem';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private repo: RepoService) { }

  selectedId?: number;
  list: OrgItem[] = [];

  ngOnInit(): void {
    this.getList();
  }

  getList() {
    this.repo.getList(0).then(list => {
      this.list = list;
      if (this.list.length) {
        this.selectedId = list[0].id;
      }
    });
  }

  onClick(item: OrgItem) {
    this.selectedId = item.id;
  }

  onDblClick(item: OrgItem) {
    this.router.navigate(['chart', item.id]);
  }

  onAdd() {
    const item: OrgItem = {
      name: 'New chart',
      parent: 0,
      root: 0,
      level: 0,
      description: ''
    };
    this.repo.add(item).then(id => {
      this.router.navigate(['chart', id]);
    });
  }

  onDelete() {
    if (!this.selectedId) {
      return;
    }
    this.repo.delete(this.selectedId).then(() => {
      this.getList();
    });
  }

}
