import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';
import TopBar from '../components/layout/TopBar';
import Avatar from '../components/ui/Avatar';
import Field from '../components/ui/Field';
import { suggestedInterests } from '../data/mockData';
import type { Profile } from '../types';

type EditProfilePageProps = {
  onOpenReport: () => void;
  onSave: (nextProfile: Pick<Profile, 'alias' | 'bio' | 'interests'>) => void;
  profile: Profile;
};

function EditProfilePage({ onOpenReport, onSave, profile }: EditProfilePageProps) {
  const navigate = useNavigate();
  const [alias, setAlias] = useState(profile.alias);
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState(profile.interests);
  const [tagInput, setTagInput] = useState('');

  function addInterest(nextInterest: string) {
    const normalized = nextInterest.trim();

    if (!normalized || interests.includes(normalized)) {
      return;
    }

    setInterests((current) => [...current, normalized]);
    setTagInput('');
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addInterest(tagInput);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ alias, bio, interests });
    navigate('/profile');
  }

  return (
    <main className="relative z-[1] min-h-screen px-6 pb-[7.5rem] pt-[6rem] animate-[page-fade_320ms_ease-out]">
      <TopBar backTo="/profile" onOpenReport={onOpenReport} title="Edit Profile" />
      <section className="mx-auto flex w-full max-w-[70rem] flex-col gap-6">
        <div className="relative flex flex-col items-center gap-[0.75rem]">
          <Avatar alias={alias} size="large" />
          <button
            className="absolute right-0 bottom-[2.75rem] inline-grid h-12 w-12 place-items-center rounded-full bg-surface-highest/28 text-text-muted transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
            type="button"
          >
            <span className="material-symbols-outlined">photo_camera</span>
          </button>
          <p className="text-text-muted">Change Profile Picture</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field icon="alternate_email" label="Username" onChange={setAlias} value={alias} />

          <label className="flex flex-col gap-[0.55rem]">
            <span className="text-[0.72rem] font-bold tracking-[0.16em] uppercase text-text-muted">Bio</span>
            <textarea
              className="w-full rounded-2xl border border-transparent bg-surface-lowest px-4 py-[0.9rem] text-text outline-none transition-all duration-200 focus:border-primary/36 focus:shadow-[0_0_0_3px_rgba(221,184,255,0.12)] resize-none"
              onChange={(event) => setBio(event.target.value)}
              rows={5}
              value={bio}
            />
          </label>

          <div className="flex flex-col gap-[0.55rem]">
            <span className="text-[0.72rem] font-bold tracking-[0.16em] uppercase text-text-muted">Interests</span>
            <div className="flex min-h-[7.25rem] flex-wrap gap-[0.65rem] rounded-[1.25rem] border border-outline/12 bg-surface-lowest p-4">
              {interests.map((interest) => (
                <button
                  className="inline-flex items-center gap-[0.35rem] min-h-[2.35rem] px-[0.9rem] py-[0.45rem] rounded-full text-primary bg-primary/16 border border-outline/16"
                  key={interest}
                  onClick={() => setInterests((current) => current.filter((entry) => entry !== interest))}
                  type="button"
                >
                  {interest}
                  <span className="material-symbols-outlined text-[1rem]">close</span>
                </button>
              ))}

              <input
                className="flex-1 min-w-[8rem] text-text bg-transparent border-0 outline-0"
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add more..."
                value={tagInput}
              />
            </div>

            <div className="flex flex-wrap gap-[0.65rem]">
              {suggestedInterests.map((interest) => (
                <button
                  className="inline-flex items-center gap-[0.35rem] min-h-[2.35rem] px-[0.9rem] py-[0.45rem] rounded-full text-text-muted bg-surface-highest/24 border border-outline/16"
                  key={interest}
                  onClick={() => addInterest(interest)}
                  type="button"
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl bg-gradient-to-br from-primary to-primary-strong px-[1.2rem] py-[0.95rem] font-extrabold text-[#2c0051] shadow-[0_14px_32px_rgba(127,44,203,0.24)] transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
              type="submit"
            >
              Save Changes
            </button>
            <button
              className="inline-flex min-h-[3.5rem] items-center justify-center gap-[0.6rem] rounded-2xl border border-outline/18 bg-[#1b1b1f]/92 px-[1.2rem] py-[0.95rem] font-extrabold text-text transition-all duration-160 hover:-translate-y-px active:scale-[0.98]"
              onClick={() => navigate('/profile')}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
      <BottomNav active="profile" />
    </main>
  );
}

export default EditProfilePage;
