"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, UploadCloud, ShieldCheck } from "lucide-react"

export default function TeamRegistration() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    jerseyNumber: "",
  })
  const [idFront, setIdFront] = useState<File | null>(null)
  const [idBack, setIdBack] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Basic Validation
    if (!idFront || !idBack) {
      toast.error("Missing Documents", { description: "Please upload both front and back ID photos." })
      return
    }

    setLoading(true)
    toast.info("Uploading player data...")

    try {
      // 2. Extract file extensions (e.g., 'jpg', 'png', 'jpeg')
      const frontExt = idFront.name.split('.').pop()
      const backExt = idBack.name.split('.').pop()

      // 3. Create mathematically safe, unique names using the exact timestamp
      // Example result: ids/1715760000_front.jpg
      const timestamp = Date.now()
      const frontPath = `ids/${timestamp}_front.${frontExt}`
      const backPath = `ids/${timestamp}_back.${backExt}`
      
      // 4. Upload Front ID
      const { data: frontData, error: frontError } = await supabase.storage
        .from('player-ids')
        .upload(frontPath, idFront)
      if (frontError) throw frontError

      // 5. Upload Back ID
      const { data: backData, error: backError } = await supabase.storage
        .from('player-ids')
        .upload(backPath, idBack)
      if (backError) throw backError

      // 6. Save to Database
      const { error: dbError } = await supabase
        .from('players')
        .insert([{
          full_name: formData.fullName,
          jersey_number: parseInt(formData.jerseyNumber),
          id_front_url: frontData.path,
          id_back_url: backData.path,
          // Note: In a fully finished app, team_id would come from the logged-in manager's auth context
        }])

      if (dbError) throw dbError

      // 7. Success!
      toast.success("Player Registered!", { description: `${formData.fullName} has been securely added to the database.` })
      
      // Reset form so they can add the next player
      setFormData({ fullName: "", jerseyNumber: "" })
      setIdFront(null)
      setIdBack(null)
      ;(document.getElementById("consent") as HTMLInputElement).checked = false

    } catch (error: any) {
      console.error("Error saving player:", error)
      toast.error("Registration Failed", { description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-lg border-2 border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Player Registration</CardTitle>
          </div>
          <CardDescription>
            Register a new player for Murang’a Rugby. All data is handled in compliance with the Kenya DPA.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name (As it appears on ID)</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                required 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="jersey">Jersey Number</Label>
              <Input 
                id="jersey" 
                type="number" 
                placeholder="10" 
                required 
                value={formData.jerseyNumber}
                onChange={(e) => setFormData({...formData, jerseyNumber: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>ID Photo (Front)</Label>
                <div className="relative flex flex-col items-center justify-center py-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
                  <UploadCloud className="w-6 h-6 mb-2 text-slate-400" />
                  <span className="text-xs text-center text-slate-500 px-2 truncate w-full">
                    {idFront ? idFront.name : "Upload Front"}
                  </span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>ID Photo (Back)</Label>
                <div className="relative flex flex-col items-center justify-center py-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900">
                  <UploadCloud className="w-6 h-6 mb-2 text-slate-400" />
                  <span className="text-xs text-center text-slate-500 px-2 truncate w-full">
                     {idBack ? idBack.name : "Upload Back"}
                  </span>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*" 
                    onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start mt-2 space-x-2">
              <input type="checkbox" id="consent" className="mt-1" required />
              <Label htmlFor="consent" className="text-xs leading-none text-slate-500">
                I confirm that I have obtained explicit consent from this player to process their biometric data for tournament verification purposes.
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Register Player"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}