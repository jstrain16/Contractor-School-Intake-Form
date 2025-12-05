"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

type Profile = {
  id: string
  email: string | null
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
}

export function AuthPanel() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sessionUser, setSessionUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        setSessionUser({
          id: data.session.user.id,
          email: data.session.user.email ?? null,
        })
        await ensureProfileRow()
      }
    }
    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession?.user) {
        setSessionUser({
          id: currentSession.user.id,
          email: currentSession.user.email ?? null,
        })
        await ensureProfileRow()
      } else {
        setSessionUser(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const ensureProfileRow = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) return
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? null,
      })
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleSignOut = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Account Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionUser ? (
          <div className="space-y-2">
            <p className="text-sm">Signed in as <span className="font-medium">{sessionUser.email}</span></p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        {sessionUser ? (
          <Button onClick={handleSignOut} disabled={loading}>Sign out</Button>
        ) : (
          <>
            <Button onClick={handleSignIn} disabled={loading}>Sign in</Button>
            <Button variant="outline" onClick={handleSignUp} disabled={loading}>Sign up</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}


