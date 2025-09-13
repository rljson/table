// @license
// Copyright (c) 2025 Rljson
//
// Use of this source code is governed by terms that can be
// found in the LICENSE file in the root of this package.

import {
  BehaviorSubject,
  combineLatest,
  filter,
  map,
  Observable,
  shareReplay,
} from 'rxjs';

import {
  ColumnSelection,
  exampleEmptyRowFilter,
  RowFilter,
  RowFilterProcessor,
  RowSort,
  Table,
  TableFiltered,
  TableSelected,
  TableSorted,
  TableWithData,
} from '../index.ts';

/**
 * Provides selected and filtered, sorted versions of an master table
 *
 * Each time the master table, column selection, filter or sort changes,
 * the resulting table is updated.
 */
export class TableView {
  /**
   * Constructor
   * @param masterTable$ The master table providing the basic data for the view
   * @param columnSelection$ The columns to be selected from the master table
   * @param filter$ The filter to apply to the table
   * @param sort$ The sort order to apply to the table
   * @param onDispose Handler called when table view is disposed
   * @param errorHandler Handler called when errors happen
   */
  constructor(
    public readonly masterTable$: Observable<Table>,
    public readonly columnSelection$: Observable<ColumnSelection>,
    public readonly filter$: Observable<RowFilter>,
    public readonly sort$: Observable<RowSort>,
    public readonly onDispose:
      | ((view: TableView) => void)
      | undefined = undefined,

    public readonly errorHandler = (e: any) => console.error(e),
  ) {
    this._table$ = this._initTable(
      masterTable$,
      columnSelection$,
      filter$,
      sort$,
    );
  }

  /**
   * Call this method when the mixer is to be disposed.
   * Will trigger a call of onDispose
   */
  dispose() {
    this.onDispose?.call(this, this);
  }

  /**
   * The table resulting from applying the column selection,
   * filter and sort to the master table.
   */
  get table(): Observable<Table> {
    return this._table$;
  }

  /**
   * An example table view with example data
   * @param errorHandler Handler called when errors happen
   */
  static example(
    errorHandler: undefined | ((error: any) => void) = undefined,
  ): TableView {
    const table = TableWithData.example();
    const masterTable = new BehaviorSubject<Table>(table);
    const columnSelection = new BehaviorSubject<ColumnSelection>(
      table.columnSelection,
    );
    const filter = new BehaviorSubject<RowFilter>(exampleEmptyRowFilter());
    const sort = new BehaviorSubject<RowSort>(RowSort.empty);

    return new TableView(
      masterTable,
      columnSelection,
      filter,
      sort,
      undefined,
      errorHandler,
    );
  }

  // ######################
  // Private
  // ######################

  _table$: Observable<Table>;

  _reportMissingColumnsTimeout: number | undefined = undefined;

  // ...........................................................................
  private _initTable(
    masterTable: Observable<Table>,
    columnSelection: Observable<ColumnSelection>,
    rowFilter: Observable<RowFilter>,
    sort: Observable<RowSort>,
  ): Observable<Table> {
    // First select the right columns from the master table
    const tableSelected = combineLatest([masterTable, columnSelection]).pipe(
      filter(([table, selection]) => {
        const missingColumns = this._missingColumns(table, selection);
        if (missingColumns.length > 0) {
          // If the missing columns are not cleared within a second, report them
          this._reportMissingColumns(missingColumns);
          return false;
        }

        this._cancelReportMissingColumns();

        return true;
      }),
      map(([table, selection]) => new TableSelected(selection, table)),
    );

    // Turn filter into filter processor
    const filterProcessor = rowFilter.pipe(
      map((f) => RowFilterProcessor.fromModel(f)),
    );

    // Filter rows
    const tableFiltered = combineLatest([tableSelected, filterProcessor]).pipe(
      map(([table, filter]) => new TableFiltered(table, filter)),
    );

    // Sort rows
    const tableSorted = combineLatest([tableFiltered, sort]).pipe(
      map(([table, sort]) => new TableSorted(table, sort)),
    );

    // Share the result
    const result = tableSorted.pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    return result;
  }

  // ...........................................................................
  private _missingColumns(table: Table, selection: ColumnSelection): string[] {
    return selection.addedColumns(table.columnSelection);
  }

  // ...........................................................................
  private _reportMissingColumns(missingColumns: string[]) {
    this._reportMissingColumnsTimeout = setTimeout(() => {
      this.errorHandler(
        'Warning: Could not apply column selection to master table: ' +
          'The following columns are missing: ' +
          missingColumns.join('\n'),
      );
    }, 300) as unknown as number;
  }

  // ...........................................................................
  private _cancelReportMissingColumns() {
    if (this._reportMissingColumnsTimeout !== undefined) {
      clearTimeout(this._reportMissingColumnsTimeout);
      this._reportMissingColumnsTimeout = undefined;
    }
  }
}
