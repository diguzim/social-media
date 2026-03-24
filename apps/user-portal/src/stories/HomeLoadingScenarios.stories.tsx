import type { Meta, StoryObj } from '@storybook/react';
import { HomeProfileSummary } from '../components/home/HomeProfileSummary';
import { SectionSkeleton } from '../components/loading/SectionSkeleton';
import { InlineStatus } from '../components/loading/InlineStatus';
import { PendingButton } from '../components/loading/PendingButton';

function HomeScenariosCanvas() {
  const user = {
    id: 'user-1',
    name: 'Demo User',
    username: 'demo-user',
    email: 'demo@example.com',
    emailVerifiedAt: '2026-03-20T12:00:00.000Z',
  };

  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <h2 className="text-xl font-bold text-slate-900">Initial route load</h2>
        <SectionSkeleton title="Loading profile" variant="profile" minHeight={220} />
        <SectionSkeleton title="Create a Post" variant="form" minHeight={280} />
        <SectionSkeleton title="Feed" variant="list" minHeight={280} />
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-bold text-slate-900">Section load (only feed pending)</h2>
        <HomeProfileSummary user={user} isLoading={false} isRefreshing={false} error="" />
        <SectionSkeleton title="Feed" variant="list" minHeight={280} />
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-bold text-slate-900">Background refresh</h2>
        <HomeProfileSummary user={user} isLoading={false} isRefreshing={true} error="" />
        <div className="card p-5">
          <InlineStatus message="Refreshing feed..." className="mb-3" />
          <p className="text-slate-700">Existing feed items remain visible while refresh runs.</p>
        </div>
      </section>

      <section className="grid gap-4">
        <h2 className="text-xl font-bold text-slate-900">Interaction pending</h2>
        <div className="card p-5">
          <p className="mb-3 text-slate-700">
            Create post form remains visible while submit is pending.
          </p>
          <PendingButton
            isPending
            idleText="Create Post"
            pendingText="Creating..."
            className="btn btn-primary w-full"
          />
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: 'Home/Loading Scenarios',
  component: HomeScenariosCanvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof HomeScenariosCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
