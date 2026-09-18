import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

export default function useCollapsibleOnMobile() {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  ));
  const [open, setOpen] = useState(() => (
    typeof window === 'undefined' || !window.matchMedia(MOBILE_QUERY).matches
  ));

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const apply = (matches) => {
      setIsMobile(matches);
      setOpen(!matches);
    };
    apply(media.matches);
    const onChange = (event) => apply(event.matches);
    if (media.addEventListener) {
      media.addEventListener('change', onChange);
    } else {
      media.addListener(onChange);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', onChange);
      } else {
        media.removeListener(onChange);
      }
    };
  }, []);

  return {
    isMobile,
    open,
    toggle: () => setOpen((current) => !current),
  };
}
