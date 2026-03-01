import type { Metadata } from 'next';
import ProfilePage from './ProfilePage';

export const metadata: Metadata = {
    title: 'Profile — Caro',
    description: 'Update your profile, avatar, and view your stats',
};

export default function Page() {
    return <ProfilePage />;
}
