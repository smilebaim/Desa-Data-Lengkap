import type { Village, Report, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

const userAvatar1 = PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '';
const userAvatar2 = PlaceHolderImages.find(img => img.id === 'user-avatar-2')?.imageUrl || '';
const userAvatar3 = PlaceHolderImages.find(img => img.id === 'user-avatar-3')?.imageUrl || '';
const userAvatar4 = PlaceHolderImages.find(img => img.id === 'user-avatar-4')?.imageUrl || '';

export const users: User[] = [
    { id: '1', name: 'Super Admin', username: 'superadmin', role: 'superadmin', avatarUrl: userAvatar1 },
    { id: '2', name: 'Admin User', username: 'admin', role: 'admin', avatarUrl: userAvatar2 },
    { id: '3', name: 'Operator User', username: 'operator', role: 'operator', avatarUrl: userAvatar3 },
    { id: '4', name: 'Village Staff', username: 'staff', role: 'village_staff', avatarUrl: userAvatar4 },
];

export const villages: Village[] = [
    { id: 'v1', name: 'Desa Maju Jaya', province: 'Jawa Barat', population: 5200, area: 15.5, lat: -6.9175, lng: 107.6191 },
    { id: 'v2', name: 'Kampung Asri', province: 'Bali', population: 3100, area: 8.2, lat: -8.4095, lng: 115.1889 },
    { id: 'v3', name: 'Nagari Sejahtera', province: 'Sumatera Barat', population: 7800, area: 22.1, lat: -0.9492, lng: 100.3543 },
    { id: 'v4', name: 'Dusun Rindang', province: 'Kalimantan Timur', population: 1200, area: 35.0, lat: 0.5021, lng: 117.1534 },
    { id: 'v5', name: 'Gampong Damai', province: 'Aceh', population: 4500, area: 12.8, lat: 5.5483, lng: 95.3238 },
];

const reportImage1 = PlaceHolderImages.find(img => img.id === 'report-image-1');
const reportImage2 = PlaceHolderImages.find(img => img.id === 'report-image-2');

export const reports: Report[] = [
    { 
        id: 'r1', 
        title: 'Pembangunan Jembatan Gotong Royong', 
        villageId: 'v1', 
        authorId: '2', 
        date: '2024-05-15', 
        content: 'Kegiatan gotong royong untuk membangun jembatan penghubung antar dusun telah selesai dilaksanakan dengan sukses. Warga sangat antusias.',
        imageUrl: reportImage1?.imageUrl,
        imageHint: reportImage1?.imageHint,
    },
    { 
        id: 'r2', 
        title: 'Pelatihan Pertanian Organik', 
        villageId: 'v2', 
        authorId: '3', 
        date: '2024-06-01', 
        content: 'Pelatihan pertanian organik diikuti oleh 50 petani. Diharapkan dapat meningkatkan hasil panen dan pendapatan warga.',
        imageUrl: reportImage2?.imageUrl,
        imageHint: reportImage2?.imageHint,
    },
    { 
        id: 'r3', 
        title: 'Perbaikan Sistem Irigasi', 
        villageId: 'v3', 
        authorId: '4', 
        date: '2024-06-20', 
        content: 'Sistem irigasi di area persawahan utama telah diperbaiki untuk memastikan pasokan air yang cukup selama musim tanam.',
    },
];
