// 全局键盘快捷键的公共守卫：无修饰键、非 repeat、焦点不在输入控件

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function isPlainKeydown(e: KeyboardEvent): boolean {
  return (
    !e.metaKey &&
    !e.ctrlKey &&
    !e.altKey &&
    !e.shiftKey &&
    !e.repeat &&
    !isEditableTarget(e.target)
  );
}
