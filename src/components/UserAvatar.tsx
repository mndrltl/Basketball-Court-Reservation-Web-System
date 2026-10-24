import React, { useState } from 'react';
import { UserRound } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  alt: string;
  className: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, alt, className }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      <img
        alt={alt}
        className={`${className} object-cover`}
        onError={() => setFailedSrc(src)}
        src={src}
      />
    );
  }

  return (
    <span
      aria-label={alt}
      className={`${className} flex items-center justify-center overflow-hidden bg-[#f1f3f5] text-[#5f6368]`}
      role="img"
    >
      <UserRound aria-hidden="true" className="h-[58%] w-[58%]" strokeWidth={1.7} />
    </span>
  );
};
