import todo from '@bemedev/bible';

describe('project1 tests', () => {
  test('runs core todo function', () => {
    expect(todo()).toBe('todo');
  });
});
