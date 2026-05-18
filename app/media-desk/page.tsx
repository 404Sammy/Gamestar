"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Megaphone, Trash2, ShieldCheck, Image as ImageIcon, Video, Trophy, UploadCloud, Link as LinkIcon } from "lucide-react"

type Announcement = { id: string, type: string, title: string, content: string, media_url: string, media_type: string, created_at: string }

export default function MediaDesk() {
  const [posts, setPosts] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)

  // Form States
  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  
  // NEW: Media States
  const [uploadMode, setUploadMode] = useState<"local" | "url">("local")
  const [localFile, setLocalFile] = useState<File | null>(null)
  const [internetUrl, setInternetUrl] = useState("")

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (data) setPosts(data as any)
  }

  const handleCreatePost = async () => {
    if (!type || !title || !content) { toast.error("Please fill required text fields"); return }
    
    setLoading(true)
    let finalMediaUrl = ""
    let finalMediaType = "image"

    try {
      // HANDLE LOCAL FILE UPLOAD
      if (uploadMode === 'local' && localFile) {
        toast.info("Uploading media file...")
        
        // Create a unique file name to prevent overwriting
        const fileExt = localFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage.from('media').upload(fileName, localFile)
        if (uploadError) throw uploadError

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName)
        finalMediaUrl = publicUrl
        finalMediaType = localFile.type.startsWith('video') ? 'video' : 'image'
      } 
      // HANDLE INTERNET URL
      else if (uploadMode === 'url' && internetUrl) {
        finalMediaUrl = internetUrl
        // Guess if it's a video based on extension
        finalMediaType = internetUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
      }

      // Save to Database
      const { error: dbError } = await supabase.from('announcements').insert([{ 
        type, title, content, 
        media_url: finalMediaUrl, 
        media_type: finalMediaType 
      }])
      
      if (dbError) throw dbError

      toast.success("Broadcasted to Match Center!")
      setType(""); setTitle(""); setContent(""); setLocalFile(null); setInternetUrl("")
      fetchPosts()

    } catch (err: any) {
      console.error(err)
      toast.error("Upload Failed", { description: err.message })
    }
    
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post? It will be removed from the public feed.")) return;
    setLoading(true)
    await supabase.from('announcements').delete().eq('id', id)
    toast.success("Post removed")
    fetchPosts()
    setLoading(false)
  }

  const getIcon = (postType: string) => {
    if (postType === 'Highlight') return <Video className="w-4 h-4 mr-1" />
    if (postType === 'Prize') return <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
    return <Megaphone className="w-4 h-4 mr-1 text-blue-500" />
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-5xl space-y-8">
        
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-bold dark:text-white">Media & Content Desk</h1><p className="text-slate-500">Upload video highlights and news to the Match Center.</p></div>
          <Badge variant="outline" className="px-4 py-1 bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"><ShieldCheck className="w-4 h-4 mr-2" /> Content Manager</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Post Creator Form */}
          <Card className="md:col-span-1 border-2 shadow-sm h-fit">
            <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50"><CardTitle className="flex items-center text-lg"><Megaphone className="w-5 h-5 mr-2 text-fuchsia-600" /> New Broadcast</CardTitle></CardHeader>
            <CardContent className="space-y-4 pt-6">
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Post Category *</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-white dark:bg-slate-950"><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Announcement">News / Announcement</SelectItem>
                    <SelectItem value="Highlight">Match Highlight</SelectItem>
                    <SelectItem value="Prize">Tournament Prize</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Headline *</label>
                <Input placeholder="e.g., Epic try from the halfway line!" className="bg-white dark:bg-slate-950 font-bold" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-500">Caption / Content *</label>
                <Textarea placeholder="Write your hype text here..." className="bg-white dark:bg-slate-950 min-h-[80px]" value={content} onChange={(e) => setContent(e.target.value)} />
              </div>

              {/* NEW: DUAL UPLOAD UI */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-500">Attach Media</label>
                  <div className="flex space-x-2">
                    <Badge 
                      variant={uploadMode === 'local' ? 'default' : 'outline'} 
                      className="cursor-pointer text-[10px] uppercase" 
                      onClick={() => setUploadMode('local')}
                    >
                      <UploadCloud className="w-3 h-3 mr-1" /> File
                    </Badge>
                    <Badge 
                      variant={uploadMode === 'url' ? 'default' : 'outline'} 
                      className="cursor-pointer text-[10px] uppercase" 
                      onClick={() => setUploadMode('url')}
                    >
                      <LinkIcon className="w-3 h-3 mr-1" /> URL
                    </Badge>
                  </div>
                </div>

                {uploadMode === 'local' ? (
                  <Input 
                    type="file" 
                    accept="image/*,video/*" 
                    className="bg-white dark:bg-slate-950 cursor-pointer text-xs" 
                    onChange={(e) => setLocalFile(e.target.files ? e.target.files[0] : null)} 
                  />
                ) : (
                  <Input 
                    placeholder="https://link-to-video-or-image.com/..." 
                    className="bg-white dark:bg-slate-950 text-xs" 
                    value={internetUrl} 
                    onChange={(e) => setInternetUrl(e.target.value)} 
                  />
                )}
                <p className="text-[10px] text-slate-400">Images or MP4 Videos supported.</p>
              </div>

              <Button className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 h-12 text-lg mt-4" onClick={handleCreatePost} disabled={loading || !type || !title || !content}>
                {loading ? "Uploading..." : "Publish to Live Feed"}
              </Button>
            </CardContent>
          </Card>

          {/* Published Feed Management */}
          <Card className="md:col-span-2 border-2 shadow-sm">
            <CardHeader className="bg-slate-100/50 dark:bg-slate-900/50"><CardTitle className="text-lg">Live Feed Management</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4 max-h-[700px] overflow-y-auto">
              {posts.length === 0 ? <p className="text-slate-500 text-center py-8">No posts published yet.</p> : posts.map(post => (
                <div key={post.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-slate-900 group">
                  
                  {/* DYNAMIC MEDIA RENDERER IN DESK */}
                  {post.media_url && (
                    post.media_type === 'video' ? (
                      <video src={post.media_url} controls className="w-full sm:w-40 h-28 object-cover rounded-md bg-slate-950 flex-shrink-0" />
                    ) : (
                      <div className="w-full sm:w-40 h-28 rounded-md bg-slate-200 bg-cover bg-center flex-shrink-0 border" style={{ backgroundImage: `url(${post.media_url})` }} />
                    )
                  )}

                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="flex items-center text-[10px] uppercase tracking-widest bg-slate-50">{getIcon(post.type)} {post.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(post.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <h3 className="font-bold text-lg leading-tight">{post.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{post.content}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{new Date(post.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}