import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RepoService } from '../repo.service';
import { ChartElement } from '../_models/ChartElement';
import { OrgItem } from '../_models/OrgItem';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  colors = ['#9E9E9E', '#388E3C', '#4527A0', '#EF6C00'];
  @ViewChild('chart')
  chart?: ElementRef<SVGElement>;
  id?: number;
  newItem: OrgItem = {name: 'New Item', level: 1, description: ''};
  selected = this.newItem;
  root = this.newItem;
  list: OrgItem[] = [];
  chartElementList: ChartElement[] = [];
  WIDTH = 300;
  HEIGHT = 300;
  ELEMENT_WIDTH = 70;
  ELEMENT_HEIGHT = 40;
  PADDING = 10;
  zoom = 1;
  ZOOM_FACTOR = 1.2;
  dragMode = false;
  moveMode = false;
  startX = 0;
  startY = 0;
  x0 = 0;
  y0 = 0;
  x = 0;
  y = 0;
  viewBox = `${this.x} ${this.y} ${this.WIDTH} ${this.HEIGHT}`;

  constructor(private route: ActivatedRoute, private repo: RepoService) { }

  setChartSize() {
    if (this.chart) {
      this.WIDTH = this.chart.nativeElement.clientWidth;
      this.HEIGHT = this.chart.nativeElement.clientHeight;
      this.setViewBox();
      this.chartElementList = this.setChartElementList(this.list);
    }
  }

  ngAfterViewInit() {
    window.setTimeout(() => this.setChartSize());
  }

  @HostListener('window:resize')
  onResize() {
    this.setChartSize();
  }

  setViewBox() {
    this.viewBox = `${this.x * this.zoom} ` +
      `${this.y * this.zoom} ` +
      `${this.WIDTH * this.zoom} ` + 
      `${this.HEIGHT * this.zoom}`;
  }

  onZoomIn() {
    this.zoom /= this.ZOOM_FACTOR;
    this.setViewBox();
  }

  onZoomOut() {
    this.zoom *= this.ZOOM_FACTOR;
    this.setViewBox();
  }

  onPan() {
    this.dragMode = !this.dragMode;
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (this.dragMode) {
      this.moveMode = true;
      this.x0 = this.x;
      this.y0 = this.y;
      this.startX = e.clientX;
      this.startY = e.clientY;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(e: MouseEvent) {
    if (this.dragMode) {
      this.moveMode = false;
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (this.moveMode) {
      let dx, dy;
      dx = e.clientX - this.startX;
      dy = e.clientY - this.startY;
      this.x = this.x0 - dx * this.zoom;
      this.y = this.y0 - dy * this.zoom;
      this.setViewBox();
    }
  }

  getRoot() {
    if (this.id) {
      this.repo.getItem(this.id).then(item => {
        this.root = item;
        this.selected = this.root;
      });
    }
  }

  getList() {
    if (this.id) {
      this.repo.getList(this.id).then(list => {
        this.list = list;
        this.chartElementList = this.setChartElementList(this.list);
      });
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(paramMap => {
      const id = paramMap.get('id');
      if (id) {
        this.id = Number(id);
      }
      this.getRoot();
      this.getList();
    });
    
  }

  onChange() {
    this.repo.update(this.selected).then(() => {
      this.getList();
    });
  }

  onAdd() {
    this.repo.add({
      name: 'New Item',
      parent: this.selected.id,
      root: this.id,
      level: this.selected.level + 1,
      description: ''
    }).then(id => this.getList());
  }

  onClick(item: OrgItem) {
    this.selected = item;
  }

  onDelete() {
    if (this.selected.id) {
      this.repo.delete(this.selected.id).then(() => {
        this.selected = this.root;
        this.getList();
      });
    }
  }

  setChartElementList(list: OrgItem[]): ChartElement[] {
    const result: ChartElement[] = [];
    const x = this.WIDTH / 2;
    const y = this.ELEMENT_HEIGHT;
    const root: ChartElement = {
      item: this.root,
      x: x,
      y: y,
      childrenCount: 0,
      category: 0
    }
    result.push(root);
    this.setChildren(result, root, list);
    this.shiftChartElemens(result);
    this.setConnection(result);
    return result;
  }

  setChildren(result: ChartElement[], parent: ChartElement, list: OrgItem[]) {
    const children = list.filter(item => item.parent === parent.item.id);
    parent.childrenCount = children.length;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const offset = parent.x - (children.length - 1) / 2 * (this.ELEMENT_WIDTH + this.PADDING *2);
      const element = {
        x: offset + (this.ELEMENT_WIDTH + this.PADDING * 2) * i,
        y: parent.y + this.ELEMENT_HEIGHT * 2,
        item: child,
        parent: parent,
        category: parent.category || i + 1,
        childrenCount: 0
      };
      result.push(element);
      this.setChildren(result, element, list);
    }
  }

  setConnection(list: ChartElement[]) {
    for (let e of list) {
      if (e.parent && e.item.level) {
        e.connection = `M ${e.x} ${e.y - this.ELEMENT_HEIGHT / 2} `+
          `C ${e.x} ${e.y - this.ELEMENT_HEIGHT}, ` +
          `${e.parent.x} ${e.parent.y + this.ELEMENT_HEIGHT}, ` +
          `${e.parent.x} ${e.parent.y + this.ELEMENT_HEIGHT / 2}`
      }
    }
  }

  compareElements = (a: ChartElement, b: ChartElement) => {
    if (!a.parent || !b.parent) {
      return 0;
    }
    if (a.parent.x < b.parent.x) {
      return 1;
    }
    if (a.parent.x > b.parent.x) {
      return 1;
    }
    if (a.x < b.x) {
      return -1;
    }
    return 1;
  };

  shiftChartElemens(list: ChartElement[]) {
    let level = 1;
    while(true) {
      let offset = 0;
      const elementList = list.filter(e => e.item.level === level);
      if (!elementList.length) {
        break;
      }
      elementList.sort(this.compareElements);
      for (let i = 0; i < elementList.length - 1; i++) {
        let element = elementList[i];
        let sibling = elementList[i + 1];
        let space = sibling.x - this.ELEMENT_WIDTH - 2 * this.PADDING - element.x;
        if (space < 0) {
          sibling.x -= space;
          list.filter(e => e.parent === element).forEach(e => e.x -= space);
          offset = Math.max(-space, offset);
        }
      }
      list.filter(e => e.item.level >= level).forEach(e => e.x -= offset / 2);
      level++;
    }
  }

}
