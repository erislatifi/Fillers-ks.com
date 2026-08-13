type IconProps = { className?: string };

const base = "1.6";

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-10-9.3C.4 7.8 2 4.5 5.4 4c2.1-.3 4 .8 6.6 3.3C14.6 4.8 16.5 3.7 18.6 4c3.4.5 5 3.8 3.4 7.2-2.5 4.7-10 9.3-10 9.3z" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c1.6-3.6 4.4-5.4 7.5-5.4s5.9 1.8 7.5 5.4" />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 8.5h11l.9 11.5a1.5 1.5 0 01-1.5 1.6H7.1a1.5 1.5 0 01-1.5-1.6l.9-11.5z" />
      <path d="M9 8.5V7a3 3 0 016 0v1.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.6 6.1 20.6l1.2-6.5-4.8-4.6 6.6-.9L12 2.6z" />
    </svg>
  );
}

export function QuoteIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 8.5C4 6 6 4 9 4v2.4c-1.6.3-2.6 1.4-2.6 2.9H9V15H4V8.5zm10 0c0-2.5 2-4.5 5-4.5v2.4c-1.6.3-2.6 1.4-2.6 2.9H19V15h-5V8.5z" />
    </svg>
  );
}

/* trust / feature icons */

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5.5c0 4.6-3 8.4-7 9.5-4-1.1-7-4.9-7-9.5V6l7-3z" />
      <path d="M9 12l2 2 4-4.2" />
    </svg>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10.5h3.6L21 13.8V16h-7z" />
      <circle cx="7.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function HeadsetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13v-1a8 8 0 0116 0v1" />
      <rect x="3" y="13" width="4" height="5.5" rx="1.3" />
      <rect x="17" y="13" width="4" height="5.5" rx="1.3" />
      <path d="M19 18.8v.7a3 3 0 01-3 3h-2" />
    </svg>
  );
}

export function AwardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="5" />
      <path d="M8.5 12.8L7 21l5-2.6 5 2.6-1.5-8.2" />
    </svg>
  );
}

export function BadgeCheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5l2.2 1.3 2.5-.3 1 2.3 2.3 1-.3 2.5 1.3 2.2-1.3 2.2.3 2.5-2.3 1-1 2.3-2.5-.3L12 21.5l-2.2-1.3-2.5.3-1-2.3-2.3-1 .3-2.5L3 12l1.3-2.2-.3-2.5 2.3-1 1-2.3 2.5.3L12 2.5z" />
      <path d="M8.8 12.2l2.1 2.1 4.3-4.5" />
    </svg>
  );
}

/* category icons */

export function DropIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5c3 4 6 7.5 6 11a6 6 0 11-12 0c0-3.5 3-7 6-11z" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" />
    </svg>
  );
}

export function HairIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21c-.8-4 .5-6 .5-9a5.5 5.5 0 1111 0c0 1.6-.6 2.6-1.2 3.6" />
      <path d="M9.5 21c-.5-2.6.2-4 .2-6M14.5 21c.4-2 0-3.3-.2-5" />
    </svg>
  );
}

export function CellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="9" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CannulaIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17L17 4l3 3-13 13H4v-3z" />
      <path d="M13.5 7.5l3 3" />
    </svg>
  );
}

export function NeedleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4L4 20" />
      <path d="M9 19l-2 2M15.5 5.5l3 3M4 20l2-5 3 3-5 2z" />
    </svg>
  );
}

export function MesoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="10" rx="2.5" />
      <path d="M10 13v3a2 2 0 004 0v-3" />
      <path d="M9 7h6" />
    </svg>
  );
}

export function LaserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="9" height="6" rx="1.5" />
      <path d="M12 12h3.5l4.5-3v8l-4.5-3H12" />
      <path d="M6 16v2M9 16v3" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5.5c0 4.6-3 8.4-7 9.5-4-1.1-7-4.9-7-9.5V6l7-3z" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round">
      <path d="M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-.8 12a1.5 1.5 0 01-1.5 1.4H8.3a1.5 1.5 0 01-1.5-1.4L6 7h12z" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.3l2.3 2.3 4.7-5" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.4c0-.9.25-1.5 1.55-1.5H16.6V4.2c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.04v2.28H7.7v3h2.6V21h3.2z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4.98 3.5a2 2 0 110 4 2 2 0 010-4zM3.5 8.98h3v11.02h-3V8.98zm6.02 0h2.88v1.5h.04c.4-.76 1.4-1.56 2.88-1.56 3.08 0 3.65 2.03 3.65 4.66v6.42h-3v-5.7c0-1.36-.02-3.1-1.9-3.1-1.9 0-2.19 1.48-2.19 3v5.8h-3V8.98z" />
    </svg>
  );
}
