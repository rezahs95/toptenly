import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ShareButtons from '../../components/ShareButtons';
import Comments from '../../components/Comments';
export default function ItemPage(){
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<any>(null);
  useEffect(()=>{ if(!id) return; fetch(`/api/item/${id}`).then(r=>r.json()).then(d=>setItem(d)); }, [id]);
  if(!item) return <div className="card p-6">در حال بارگذاری...</div>;
  const title = `آیتم: ${item.title}`;
  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{item.title}</h1>
            {item.description && <p className="mt-2 opacity-80">{item.description}</p>}
            <p className="mt-3">امتیاز: {item.score ?? 0}</p>
            <a className="text-blue-600" href={`/?q=${encodeURIComponent(item.list_title)}`}>بازگشت به لیست</a>
          </div>
          <ShareButtons title={title} />
        </div>
      </div>
      <Comments itemId={String(id)} />
    </div>
  );
}
