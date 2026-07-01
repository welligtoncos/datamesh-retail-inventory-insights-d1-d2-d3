import { TestBed } from '@angular/core/testing';

import { PipelineExecutionMockStore } from './data/pipeline-execution-mock.store';
import { buildMockAudit } from './data/pipeline-mock.data';

describe('PipelineExecutionMockStore', () => {
  let store: PipelineExecutionMockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(PipelineExecutionMockStore);
  });

  it('seeds historical executions', () => {
    const list = store.listExecutions(20);
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('starts RUNNING execution with valid execution ARN', () => {
    const started = store.startExecution('2022-01-02', buildMockAudit({ sub: 'u1' }));
    expect(started.status).toBe('RUNNING');
    expect(started.execution_arn).toContain(':execution:');
    expect(started.execution_arn).not.toContain(':stateMachine:');
  });

  it('starts RUNNING execution and completes on forceComplete', () => {
    const started = store.startExecution('2022-01-02', buildMockAudit({ sub: 'u1' }));
    expect(started.status).toBe('RUNNING');

    store.forceComplete(started.execution_id, true);
    const row = store.getExecution(started.execution_id);
    expect(row?.status).toBe('SUCCEEDED');
    expect(row?.duration_seconds).not.toBeNull();
  });

  it('property: list is sorted by started_at desc', () => {
    store.startExecution('2022-01-02', buildMockAudit(null));
    const list = store.listExecutions(20);
    for (let i = 1; i < list.length; i += 1) {
      expect(list[i - 1].started_at >= list[i].started_at).toBeTrue();
    }
  });
});
