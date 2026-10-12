import { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Heart, UserPlus, ArrowRight, Trash2, X } from 'lucide-react';
import * as api from '../services/sfamilyApi.js';
import './PostsView.css';

export default function PostsView() {
  const [user,setUser] = useState(null), [posts,setPosts] = useState([]), [page,setPage] = useState(1), [hasMore,setHasMore] = useState(false);
  const [loading,setLoading] = useState(true), [busy,setBusy] = useState(false), [error,setError] = useState('');
  const [composer,setComposer] = useState(false), [file,setFile] = useState(null), [preview,setPreview] = useState(''), [shape,setShape] = useState('square'), [caption,setCaption] = useState('');
  const [tagOpen,setTagOpen] = useState(false), [people,setPeople] = useState([]), [tagged,setTagged] = useState([]), [search,setSearch] = useState(''), [tagLoading,setTagLoading] = useState(false);
  const fileRef=useRef(null), submitting=useRef(false);
  const apply = (response, append=false) => { const data=response.data; setPosts(previous => append ? [...previous,...(data.posts || [])] : (data.posts || [])); setHasMore(Boolean(data.has_more)); };
  const load = async () => { setLoading(true);setError('');try{const profile=await api.getProfileDetails();const me=profile.data?.user || profile.data;setUser(me);apply(await api.getUserPosts(me.id));setPage(1);}catch(e){setError(e.message || 'Unable to load posts.');}finally{setLoading(false);} };
  useEffect(()=>{load();},[]);
  useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
  const chooseFile = event => {const next=event.target.files?.[0];event.target.value='';if(!next)return;if(!next.type.startsWith('image/')){setError('Choose an image file.');return;}setError('');setFile(next);};
  const closeComposer=()=>{if(busy)return;setComposer(false);setFile(null);setCaption('');setTagged([]);setTagOpen(false);};
  const openTags=async()=>{setTagOpen(true);if(people.length)return;setTagLoading(true);try{const response=await api.getGroupCandidates();setPeople(response.data?.people || []);}catch(e){setError(e.message || 'Unable to load people.');}finally{setTagLoading(false);} };
  const publish=async()=>{
    if(!file || submitting.current)return;
    submitting.current=true;setBusy(true);setError('');
    try{
      // Center-crop the uploaded file itself so the shared image matches its preview.
      const image=new Image();image.src=preview;await image.decode();
      const ratio=shape==='portrait'?4/5:1;
      const cropWidth=Math.min(image.naturalWidth,image.naturalHeight*ratio),cropHeight=cropWidth/ratio;
      const canvas=document.createElement('canvas');canvas.width=Math.min(1600,Math.round(cropWidth));canvas.height=Math.round(canvas.width/ratio);
      const context=canvas.getContext('2d');if(!context)throw new Error('Unable to process this image.');
      context.drawImage(image,(image.naturalWidth-cropWidth)/2,(image.naturalHeight-cropHeight)/2,cropWidth,cropHeight,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.9));if(!blob)throw new Error('Unable to prepare this image.');
      const form=new FormData();form.append('image',blob,'post.jpg');form.append('caption',caption.trim());tagged.forEach((id,i)=>form.append(`tagged[${i}]`,id));
      await api.createPost(form);
      setComposer(false);setFile(null);setCaption('');setTagged([]);setTagOpen(false);setSearch('');
      await load();
    }catch(e){setError(e.message || 'Unable to share your post. Please retry.');}
    finally{submitting.current=false;setBusy(false);}
  };
  return <div className="posts-page">
    <header className="posts-heading"><h1>{composer?'New post':'My posts'}</h1>{composer?<button className="posts-icon-button" onClick={closeComposer} disabled={busy} aria-label="Close new post"><X size={20}/></button>:<button className="posts-primary" onClick={()=>setComposer(true)}><Camera size={18}/>New post</button>}</header>
    {error && <p className="posts-error" role="alert">{error}{!composer && <button onClick={load}>Retry</button>}</p>}
    {composer?<>
      <input ref={fileRef} type="file" accept="image/*" className="posts-file" onChange={chooseFile} />
      {preview?<div className={`posts-preview posts-preview-${shape}`}><img src={preview} alt="New post preview"/><button onClick={()=>fileRef.current?.click()} disabled={busy}>Change photo</button></div>:<button className="posts-photo-empty" onClick={()=>fileRef.current?.click()}><ImagePlus size={32}/><strong>Choose a photo</strong><span>Share a moment with your family</span></button>}
      <div className="posts-shape"><button aria-pressed={shape==='portrait'} onClick={()=>setShape('portrait')} disabled={busy}>Portrait</button><button aria-pressed={shape==='square'} onClick={()=>setShape('square')} disabled={busy}>Square</button></div>
      <label className="posts-caption">Caption<textarea maxLength={2200} value={caption} onChange={event=>setCaption(event.target.value)} placeholder="Write a caption…" disabled={busy}/><span>{caption.length}/2200</span></label>
      <button className="posts-tag" onClick={openTags} disabled={busy}><UserPlus size={19}/><span>{tagged.length?`${tagged.length} people tagged`:'Tag people'}</span><ArrowRight size={18}/></button>
      {tagOpen && <section className="posts-tags"><header><h2>Tag people</h2><button onClick={()=>setTagOpen(false)}>Done</button></header><label>Search your people<input value={search} onChange={event=>setSearch(event.target.value)}/></label>{tagLoading?<p role="status">Loading people…</p>:people.filter(person=>`${person.name} ${person.username || ''}`.toLowerCase().includes(search.toLowerCase())).map(person=><label className="posts-tag-person" key={person.id}>{person.avatar_url?<img src={person.avatar_url} alt=""/>:<span className="posts-initial">{(person.name || '?')[0]}</span>}<span>{person.name}<small>{person.username?`@${person.username.replace(/^@/,'')}`:''}</small></span><input type="checkbox" checked={tagged.includes(person.id)} onChange={event=>setTagged(previous=>event.target.checked?[...previous,person.id]:previous.filter(id=>id!==person.id))}/></label>)}</section>}
      <button className="posts-share" disabled={!file || !preview || busy} onClick={publish}>{busy?'Sharing…':'Share'}<ArrowRight size={20}/></button>
    </>:loading?<p role="status">Loading posts…</p>:<>
      {!posts.length && <div className="posts-empty"><ImagePlus size={36}/><h2>No posts yet</h2><p>Your photos and family moments will appear here.</p><button className="posts-primary" onClick={()=>setComposer(true)}>Share your first photo</button></div>}
      {posts.map(post=><article className="posts-card" key={post.id}><header>{post.author?.avatar_url && <img src={post.author.avatar_url} alt=""/>}<strong>{post.author?.username || user?.username || user?.name}</strong><button className="posts-icon-button" disabled={busy} aria-label="Delete post" onClick={async()=>{if(!window.confirm('Delete this post?'))return;setBusy(true);try{await api.deletePost(post.id);setPosts(previous=>previous.filter(item=>item.id!==post.id));}catch(e){setError(e.message);}finally{setBusy(false);}}}><Trash2 size={18}/></button></header><img className="posts-image" src={post.image_url} alt={post.caption || 'Family post'} loading="lazy"/>{post.caption && <p>{post.caption}</p>}<footer><button aria-pressed={Boolean(post.liked_by_me)} disabled={busy} onClick={async()=>{setBusy(true);try{await api.setPostLike(post.id,!post.liked_by_me);setPosts(previous=>previous.map(item=>item.id===post.id?{...item,liked_by_me:!item.liked_by_me,likes_count:Math.max(0,(item.likes_count || 0)+(item.liked_by_me?-1:1))}:item));}catch(e){setError(e.message);}finally{setBusy(false);}}}><Heart size={20}/>{post.likes_count || 0}</button><time>{post.created_at?new Date(post.created_at).toLocaleDateString():''}</time></footer></article>)}
      {hasMore && <button className="posts-primary" disabled={busy} onClick={async()=>{setBusy(true);try{const next=page+1;apply(await api.getUserPosts(user.id,next),true);setPage(next);}catch(e){setError(e.message);}finally{setBusy(false);}}}>Load more</button>}
    </>}
  </div>;
}
