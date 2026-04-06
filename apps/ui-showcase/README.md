# UI Showcase

Dedicated Storybook app for shared UI component demos.

## Purpose

- Owns component-level visual demos for shared components consumed by frontend apps.
- Uses runtime components from `@repo/ui`.
- Keeps product app stories focused on integration/page behavior.

## Scripts

- `pnpm storybook` - Start Storybook (port 6006)
- `pnpm build-storybook` - Build static Storybook docs
- `pnpm lint` - Lint stories/config
- `pnpm type-check` - Type-check showcase code

## Current Story Groups

- `src/stories/layout/Container.stories.tsx`
- `src/stories/layout/Stack.stories.tsx`
- `src/stories/layout/Grid.stories.tsx`
- `src/stories/layout/Section.stories.tsx`
- `src/stories/button/Button.stories.tsx`
- `src/stories/menu/DropdownMenu.stories.tsx`
- `src/stories/menu/FloatingPanel.stories.tsx`
- `src/stories/modal/Modal.stories.tsx`

## Run

```sh
pnpm --filter ui-showcase storybook
```

## Build Static Docs

```sh
pnpm --filter ui-showcase build-storybook
```
