import { Link } from 'react-router-dom';

interface NavLinkProps {
  path: string;
  icon: React.ComponentType<{ size: number }>;
  title: string;
  isActive: boolean;
}

export function NavLink({ path, icon: Icon, title, isActive }: NavLinkProps) {
  return (
    <Link
      to={path}
      className={`p-3 rounded-lg mb-4 transition-colors ${
        isActive
          ? 'bg-custom-orange text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      title={title}
    >
      <Icon size={16} />
    </Link>
  );
}