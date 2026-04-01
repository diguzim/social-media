import type { Meta, StoryObj } from '@storybook/react';
import { Container, Stack } from '../components/layout';

const meta: Meta = {
  title: 'Pages/Home/Layout',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const HomeLayoutStructure: Story = {
  render: () => (
    <Container maxWidth="5xl" dataTestId="home-page">
      <Stack gap="gap-8">
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Create Post Island</h2>
          <p className="text-gray-600">
            HomeCreatePostSection component wrapped in Stack with gap-8 spacing from previous
            section.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Uses design tokens for padding/gap via Tailwind utilities.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Feed Island</h2>
          <p className="text-gray-600">
            HomeFeedSection component rendered below Create Post with gap-8 spacing between islands.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Each island can load independently with its own Suspense boundary.
          </p>
        </section>
      </Stack>
    </Container>
  ),
};

export const ResponsiveContainerBehavior: Story = {
  render: () => (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-4">
        Resize viewport to see Container responsiveness:
      </p>
      <Container maxWidth="5xl">
        <Stack gap="gap-8">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm">Mobile (0-640px): maxWidth=5xl (64rem), px-4 py-10</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-sm">sm+ (640px+): same behavior, responsive utilities scale</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded p-4">
            <p className="text-sm">md+ (768px+): Container provides consistent max-width anchor</p>
          </div>
        </Stack>
      </Container>
    </div>
  ),
};

export const DesignTokensIntegration: Story = {
  render: () => (
    <Container maxWidth="4xl">
      <Stack gap="gap-8">
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Design Tokens in Action</h2>
          <Stack gap="gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Spacing Tokens:</p>
              <p className="text-gray-600">
                Stack uses gap-8 (var(--space-8) = 32px) between islands.
              </p>
              <p className="text-gray-600">
                Container uses px-4 py-10 (var(--space-4) = 16px, var(--space-10) = 40px).
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Color Tokens:</p>
              <p className="text-gray-600">Text: color: var(--color-text-primary)</p>
              <p className="text-gray-600">Background: bg-white (var(--color-bg-primary))</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Typography Tokens:</p>
              <p className="text-gray-600">
                Heading: text-2xl (var(--type-2xl)) with font-bold (var(--type-weight-bold))
              </p>
              <p className="text-gray-600">
                Body: default text-base (var(--type-base)) with var(--type-line-height-normal)
              </p>
            </div>
          </Stack>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Benefits</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Consistent spacing across pages via tokens</li>
            <li>Responsive behavior built into primitives</li>
            <li>Easier to audit and maintain visual style</li>
            <li>Type-safe component props ensure predictable layouts</li>
            <li>Tokens can be updated globally without touching components</li>
          </ul>
        </section>
      </Stack>
    </Container>
  ),
};
