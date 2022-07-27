import { Injectable, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { filter, tap } from 'rxjs/operators';
import { Store } from '../../../@core';
import { LayoutPersistance } from '../concretes/contexts/layout-persistance.class';
import { PersistanceTakers } from '../concretes/contexts/persistance-takers.class';
import { LocalstorageStrategy } from '../concretes/strategies/localstorage-strategy.class';
import { BackupStrategy } from '../interfaces/backup-strategy.interface';
import { GuiDrag } from '../interfaces/gui-drag.abstract';

@Injectable({
	providedIn: 'root'
})
export class WidgetService {
	private _widgetsRef: TemplateRef<HTMLElement>[] = [];
	private _widgets: GuiDrag[] = [];
	private _layoutPersistance: LayoutPersistance;
	private _persistanceTakers: PersistanceTakers;
	private _localStorage: BackupStrategy;
	private _widgets$: Subject<Partial<GuiDrag[]>>;
	private _strategy: BackupStrategy;

	constructor(private readonly store: Store) {
		this._layoutPersistance = new LayoutPersistance();
		this._localStorage = new LocalstorageStrategy();
		this._persistanceTakers = new PersistanceTakers(
			this._layoutPersistance
		);
		this._widgets$ = new Subject();
		this._widgets$
			.pipe(
				tap((widgets: GuiDrag[]) => (this.widgets = widgets)),
				tap(() => (this._layoutPersistance.state = this.widgets)),
				filter(() => this.widgetsRef.length === 0),
				tap(() => {
					this.retrieve().length === 0
						? this.save()
						: this.retrieve().forEach((deserialized: GuiDrag) =>
								this.widgetsRef.push(deserialized.templateRef)
						  );
				})
			)
			.subscribe();
	}

	public get widgetsRef(): TemplateRef<HTMLElement>[] {
		return this._widgetsRef;
	}

	public set widgetsRef(value: TemplateRef<HTMLElement>[]) {
		this._widgetsRef = value;
		this.sorting();
	}

	protected sorting(): void {
		const buffers: GuiDrag[] = [];
		this.widgetsRef.forEach((widgetRef: TemplateRef<HTMLElement>) => {
			this.widgets.forEach((widget: GuiDrag) => {
				if (widgetRef === widget.templateRef) {
					buffers.push(widget);
				}
			});
		});
		this.widgets = buffers;
	}

	protected sortingReverse(): void {
		const buffers: TemplateRef<HTMLElement>[] = [];
		this.widgets.forEach((widget: GuiDrag) => {
			this.widgetsRef.forEach((widgetRef: TemplateRef<HTMLElement>) => {
				if (widgetRef === widget.templateRef) {
					buffers.push(widgetRef);
				}
			});
		});
		this.widgetsRef = buffers;
	}

	public get widgets(): GuiDrag[] {
		return this._widgets;
	}

	public set widgets(value: GuiDrag[]) {
		this._widgets = value;
	}

	public save(): void {
		if (this.widgets.length === 0) return;
		this._persistanceTakers.backup();
		this._strategy = this._localStorage;
		this._strategy.serializables = this.widgets;
		this.store.widgets = this._strategy.serialize() as Partial<GuiDrag>[];
	}

	public retrieve(): Partial<GuiDrag>[] {
		this._strategy = this._localStorage;
		return this._strategy.deSerialize(this.store.widgets, this.widgets);
	}

	public undoDrag() {
		this._persistanceTakers.undo();
		this.widgets = this._layoutPersistance.state as GuiDrag[];
		this.sortingReverse();
		this._strategy = this._localStorage;
		this._strategy.serializables = this.widgets;
		this.store.widgets = this._strategy.serialize() as Partial<GuiDrag>[];
	}

	public set widgets$(value: Partial<GuiDrag[]>) {
		this._widgets$.next(value);
	}
}
