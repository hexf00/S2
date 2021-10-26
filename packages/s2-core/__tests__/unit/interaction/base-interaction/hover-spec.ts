import { Canvas, Event as GEvent } from '@antv/g-canvas';
import { omit } from 'lodash';
import { createFakeSpreadSheet, sleep } from 'tests/util/helpers';
import { S2Options, ViewMeta } from '@/common/interface';
import { HoverEvent } from '@/interaction/base-interaction/hover';
import { SpreadSheet } from '@/sheet-type';
import {
  HOVER_FOCUS_TIME,
  InteractionStateName,
  OriginEventType,
  S2Event,
} from '@/common/constant';

jest.mock('@/interaction/event-controller');

describe('Interaction Hover Tests', () => {
  let hoverEvent: HoverEvent;
  let s2: SpreadSheet;

  const mockCell: Partial<ViewMeta> = {
    id: '1',
    colIndex: 0,
    rowIndex: 0,
    type: undefined,
  };
  const mockCellMeta = omit(mockCell, 'update');
  const mockCellUpdate = jest.fn();
  const container = document.createElement('div');

  beforeEach(() => {
    s2 = createFakeSpreadSheet();
    s2.getCell = () =>
      ({
        update: mockCellUpdate,
        getMeta: () => mockCell,
      } as any);
    hoverEvent = new HoverEvent(s2 as unknown as SpreadSheet);
    s2.options = {
      interaction: {
        hoverHighlight: true,
      },
      tooltip: {
        operation: {},
      },
    } as S2Options;
    s2.container = new Canvas({
      width: 100,
      height: 100,
      container,
    });
    s2.isTableMode = jest.fn(() => true);
  });

  afterEach(() => {
    mockCellUpdate.mockReset();
  });

  afterAll(() => {
    mockCellUpdate.mockRestore();
  });

  test('should bind events', () => {
    expect(hoverEvent.bindEvents).toBeDefined();
  });

  test('should trigger data cell hover', async () => {
    s2.emit(S2Event.DATA_CELL_HOVER, { target: {} } as GEvent);
    expect(s2.interaction.getState()).toEqual({
      cells: [mockCellMeta],
      stateName: InteractionStateName.HOVER,
    });

    await sleep(1000);

    expect(s2.interaction.getState()).toEqual({
      cells: [mockCellMeta],
      stateName: InteractionStateName.HOVER_FOCUS,
    });
    expect(s2.showTooltipWithInfo).toHaveBeenCalled();
  });

  test('should trigger row cell hover', async () => {
    s2.emit(S2Event.ROW_CELL_HOVER, { target: {} } as GEvent);
    expect(s2.interaction.getState()).toEqual({
      cells: [mockCellMeta],
      stateName: InteractionStateName.HOVER,
    });
    expect(mockCellUpdate).toHaveBeenCalled();
    expect(s2.showTooltipWithInfo).toHaveBeenCalled();
  });

  test('should trigger col cell hover', async () => {
    s2.emit(S2Event.COL_CELL_HOVER, { target: {} } as GEvent);
    expect(s2.interaction.getState()).toEqual({
      cells: [mockCellMeta],
      stateName: InteractionStateName.HOVER,
    });
    expect(mockCellUpdate).toHaveBeenCalled();
    expect(s2.showTooltipWithInfo).toHaveBeenCalled();
  });

  // test('should clear hover focus timer when cell clicked', async () => {
  //   s2.emit(S2Event.DATA_CELL_HOVER, { target: {} } as GEvent);

  //   // click date cell before will trigger hover focus
  //   await sleep(HOVER_FOCUS_TIME - 200);

  //   const mockEvent = {
  //     preventDefault: () => {},
  //     originalEvent: {},
  //   };
  //   s2.container.emit(OriginEventType.MOUSE_DOWN, mockEvent);

  //   await sleep(1000);

  //   expect(s2.interaction.getCurrentStateName()).not.toEqual(
  //     InteractionStateName.HOVER_FOCUS,
  //   );
  // });
});
