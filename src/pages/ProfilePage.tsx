import { Link } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import TopBar from '../components/layout/TopBar';
import ActivityRow from '../components/ui/ActivityRow';
import Avatar from '../components/ui/Avatar';
import StatBox from '../components/ui/StatBox';
import type { Profile } from '../types';

type ProfilePageProps = {
  onOpenReport: () => void;
  profile: Profile;
};

function ProfilePage({ onOpenReport, profile }: ProfilePageProps) {
  return (
    <main className="relative z-[1] min-h-screen px-6 pb-[7.5rem] pt-[6rem] animate-[page-fade_320ms_ease-out]">
      <TopBar onOpenReport={onOpenReport} title="Profile" />
      <section className="mx-auto flex w-full max-w-[70rem] flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-[1.2fr_2fr]">
          <div className="relative flex flex-col items-center justify-center gap-4 rounded-3xl border border-outline bg-[#1f1f23]/88 p-6 text-center shadow-main">
            <Avatar alias={profile.alias} size="large" />
            <div className="profile-heading">
              <h2 className="m-0 font-jakarta font-extrabold tracking-tight">{profile.alias}</h2>
              <p className="m-0 mt-[0.35rem] text-text-muted">ID: 8829-X</p>
            </div>
          </div>

          <div className="relative flex flex-col gap-4 rounded-3xl border border-outline bg-[#1f1f23]/88 p-6 shadow-main">
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-text-muted">The Confessional</span>
              <div className="inline-flex min-h-[2rem] items-center gap-[0.55rem] rounded-full bg-surface-high/88 px-[0.9rem] py-[0.45rem] text-text-muted">
                <span className="h-[0.55rem] w-[0.55rem] rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
                <span>Online</span>
              </div>
            </div>

            <p className="italic leading-[1.7]">"{profile.bio}"</p>

            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Whispers" value={profile.whispers} />
              <StatBox label="Rooms" value={profile.rooms} />
              <StatBox label="Trust" value={`${profile.trust}%`} />
            </div>
          </div>

          <Link
            className="inline-flex min-h-[3.5rem] w-full items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98] md:col-span-2"
            to="/profile/edit"
          >
            <span className="material-symbols-outlined">edit</span>
            Edit Profile
          </Link>

          <div className="relative flex flex-col gap-4 rounded-3xl border border-outline bg-[#1f1f23]/88 p-6 shadow-main">
            <h3 className="m-0 mb-[0.45rem] font-jakarta font-extrabold tracking-tight">Frequency Interests</h3>
            <div className="flex flex-wrap gap-[0.65rem]">
              {profile.interests.map((interest) => (
                <span className="inline-flex min-h-[2.35rem] items-center gap-[0.35rem] rounded-full border border-outline/16 bg-surface-highest/66 px-[0.9rem] py-[0.45rem] text-text" key={interest}>
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center gap-4 rounded-3xl border border-outline bg-[#1f1f23]/88 p-6 shadow-main lg:col-span-1">
            <span className="material-symbols-outlined text-[2.5rem] text-primary">shield_person</span>
            <p className="text-center text-text-muted">Your identity is encrypted and stored in the localized shadow registry.</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-highest/50">
              <div className="h-full rounded-inherit bg-gradient-to-r from-primary to-primary-strong" style={{ width: '75%' }} />
            </div>
            <small className="text-text-muted">Privacy Score: 75%</small>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="m-0 font-jakarta font-extrabold tracking-tight">Recent Confessions</h3>
          <div className="flex flex-col gap-4">
            <ActivityRow icon="forum" subtitle="2 hours ago" title='Shared a memory in "#TheRainyRoom"' />
            <ActivityRow icon="favorite" subtitle="Yesterday" title='Received 15 resonance on "Midnight Thought #4"' />
          </div>
        </div>
      </section>
      <BottomNav active="profile" />
    </main>
  );
}

export default ProfilePage;
