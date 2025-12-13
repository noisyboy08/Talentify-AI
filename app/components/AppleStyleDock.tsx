import { Link } from 'react-router';
import {
  Activity,
  Component,
  Home,
  Mail,
  Package,
  ScrollText,
  SunMoon,
  Upload,
  BarChart3,
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '~/components/ui/dock';

const data = [
  {
    title: 'Home',
    icon: (
      <Home className='h-full w-full text-gray-700' />
    ),
    href: '/',
  },
  {
    title: 'Dashboard',
    icon: (
      <BarChart3 className='h-full w-full text-gray-700' />
    ),
    href: '/dashboard',
  },
  {
    title: 'Upload Resume',
    icon: (
      <Upload className='h-full w-full text-gray-700' />
    ),
    href: '/upload',
  },
  {
    title: 'Activity',
    icon: (
      <Activity className='h-full w-full text-gray-700' />
    ),
    href: '/activity',
  },
  {
    title: 'Change Log',
    icon: (
      <ScrollText className='h-full w-full text-gray-700' />
    ),
    href: '/changelog',
  },
  {
    title: 'Contact',
    icon: (
      <Mail className='h-full w-full text-gray-700' />
    ),
    href: '/contact',
  },
];

export function AppleStyleDock() {
  return (
    <>
      {/* Mobile: Bottom Navigation */}
      <div className='fixed bottom-0 left-0 right-0 md:hidden z-[100] flex items-center justify-center pointer-events-none pb-3 sm:pb-4'>
        <div className='flex items-center justify-center w-full'>
          <Dock className='flex-row items-center justify-center px-3 sm:px-4 py-2 sm:py-3' magnification={60} distance={120}>
            {data.map((item, idx) => (
              <Link key={idx} to={item.href} className="block pointer-events-auto">
                <DockItem className='aspect-square rounded-full bg-white/95 backdrop-blur-md cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 shadow-xl border border-gray-200/50 hover:scale-110 active:scale-95 touch-manipulation'>
                  <DockLabel className='bottom-full left-1/2 -translate-x-1/2 mb-2 right-auto top-auto translate-y-0'>{item.title}</DockLabel>
                  <DockIcon>{item.icon}</DockIcon>
                </DockItem>
              </Link>
            ))}
          </Dock>
        </div>
      </div>
      
      {/* Desktop: Right Side Navigation */}
      <div className='hidden md:flex fixed right-2 lg:right-4 top-1/2 -translate-y-1/2 z-[100] h-full items-center pointer-events-none'>
        <Dock className='flex-col items-center py-2 lg:py-3' magnification={60} distance={120}>
          {data.map((item, idx) => (
            <Link key={idx} to={item.href} className="block pointer-events-auto">
              <DockItem className='aspect-square rounded-full bg-white/95 backdrop-blur-md cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 shadow-xl border border-gray-200/50 hover:scale-110 active:scale-95 touch-manipulation'>
                <DockLabel>{item.title}</DockLabel>
                <DockIcon>{item.icon}</DockIcon>
              </DockItem>
            </Link>
          ))}
        </Dock>
      </div>
    </>
  );
}

