import { useCallback, useEffect } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';

interface KeyboardNavigationOptions {
  onEnter?: (path: string) => void;
  onDelete?: (paths: string[]) => void;
  onCopy?: (paths: string[]) => void;
  onPaste?: () => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    currentItems,
    focusedItem,
    selectedItems,
    setFocusedItem,
    selectItem,
    clearSelection,
    navigateBack,
    navigateForward,
    navigateUp
  } = useExplorerStore();

  const getItemIndex = useCallback(
    (path: string) => currentItems.findIndex(item => item.path === path),
    [currentItems]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const modifier = ctrlKey || metaKey;

      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          if (focusedItem) {
            const index = getItemIndex(focusedItem);
            if (index > 0) {
              const newPath = currentItems[index - 1].path;
              setFocusedItem(newPath);
              if (!shiftKey) clearSelection();
              selectItem(newPath, shiftKey);
            }
          } else if (currentItems.length > 0) {
            setFocusedItem(currentItems[0].path);
          }
          break;

        case 'ArrowDown':
          event.preventDefault();
          if (focusedItem) {
            const index = getItemIndex(focusedItem);
            if (index < currentItems.length - 1) {
              const newPath = currentItems[index + 1].path;
              setFocusedItem(newPath);
              if (!shiftKey) clearSelection();
              selectItem(newPath, shiftKey);
            }
          } else if (currentItems.length > 0) {
            setFocusedItem(currentItems[0].path);
          }
          break;

        case 'ArrowLeft':
          if (modifier) {
            event.preventDefault();
            navigateBack();
          }
          break;

        case 'ArrowRight':
          if (modifier) {
            event.preventDefault();
            navigateForward();
          }
          break;

        case 'Enter':
          if (focusedItem && options.onEnter) {
            event.preventDefault();
            options.onEnter(focusedItem);
          }
          break;

        case 'Backspace':
          event.preventDefault();
          navigateUp();
          break;

        case 'Delete':
          if (selectedItems.size > 0 && options.onDelete) {
            event.preventDefault();
            options.onDelete(Array.from(selectedItems));
          }
          break;

        case 'a':
          if (modifier) {
            event.preventDefault();
            currentItems.forEach(item => selectItem(item.path, true));
          }
          break;

        case 'c':
          if (modifier && selectedItems.size > 0 && options.onCopy) {
            event.preventDefault();
            options.onCopy(Array.from(selectedItems));
          }
          break;

        case 'v':
          if (modifier && options.onPaste) {
            event.preventDefault();
            options.onPaste();
          }
          break;

        case 'Escape':
          clearSelection();
          setFocusedItem(null);
          break;

        case 'Home':
          if (currentItems.length > 0) {
            event.preventDefault();
            setFocusedItem(currentItems[0].path);
            if (!shiftKey) clearSelection();
            selectItem(currentItems[0].path);
          }
          break;

        case 'End':
          if (currentItems.length > 0) {
            event.preventDefault();
            const lastItem = currentItems[currentItems.length - 1];
            setFocusedItem(lastItem.path);
            if (!shiftKey) clearSelection();
            selectItem(lastItem.path);
          }
          break;
      }
    },
    [
      currentItems,
      focusedItem,
      selectedItems,
      setFocusedItem,
      selectItem,
      clearSelection,
      navigateBack,
      navigateForward,
      navigateUp,
      getItemIndex,
      options
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedItem, selectedItems };
}
