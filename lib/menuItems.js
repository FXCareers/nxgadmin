import {
    FileText,
    Users,
    Briefcase,
    Award,
    Home,
    MessageSquare,
    FileUser,
    Mail,
  } from 'lucide-react';
  import { RiSeoLine } from "react-icons/ri";

  export const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'hr', 'editor'] },
    { path: '/dashboard/blog', label: 'Blog', icon: FileText, roles: ['admin', 'editor'] },
    { path: '/dashboard/user', label: 'Users', icon: Users, roles: ['admin'] },
    { path: '/dashboard/subscribers', label: 'Subscribers', icon: Mail, roles: ['admin'] },
    { path: '/dashboard/seo-details', label: 'Seo Details', icon: RiSeoLine, roles: ['admin'] },
    // { path: '/dashboard/careers', label: 'Careers', icon: Briefcase, roles: ['admin', 'hr'] },
    // { path: '/dashboard/awards', label: 'Awards', icon: Award, roles: ['admin'] },
    { path: '/dashboard/contact', label: 'Contact', icon: MessageSquare, roles: ['admin'] },
    // { path: '/dashboard/applications', label: 'Applications', icon: FileUser, roles: ['admin', 'hr'] },
  ];
