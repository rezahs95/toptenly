type Props = { title: string; url?: string };
export default function ShareButtons({ title, url }: Props){
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title, url: shareUrl }); } catch {} }
    else {
      const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(tw, '_blank');
    }
  };
  return <button className="btn" onClick={share}>اشتراک‌گذاری</button>;
}
