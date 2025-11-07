"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

interface ToolPreferencesProps {
    userUuid: string;
}

export default function ToolPreferences({ userUuid }: ToolPreferencesProps) {
    const [toolPreferences, setToolPreferences] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPreferences = async () => {
            if (!userUuid) return

            setIsLoading(true)
            try {
                console.log('Fetching tool preferences for user:', userUuid)
                const { data, error } = await supabase
                    .from('buyer_tool_preferences')
                    .select('tool_preferences')
                    .eq('uuid', userUuid)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single()

                if (error) {
                    if (error.code === 'PGRST116') {
                        console.log('No existing preferences found')
                        setToolPreferences('')
                    } else {
                        console.error('Error fetching tool preferences:', error)
                        throw error
                    }
                } else if (data) {
                    console.log('Found existing preferences:', data.tool_preferences)
                    setToolPreferences(data.tool_preferences || '')
                }
            } catch (error) {
                console.error('Error fetching tool preferences:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPreferences()
    }, [userUuid])

    const handleSubmit = async () => {
        if (!userUuid) {
            toast.error('User not found')
            return
        }

        setIsSubmitting(true)
        try {
            // First, try to delete any existing preferences for this user
            const { error: deleteError } = await supabase
                .from('buyer_tool_preferences')
                .delete()
                .eq('uuid', userUuid)

            if (deleteError) throw deleteError

            // Then insert the new preferences
            const { error: insertError } = await supabase
                .from('buyer_tool_preferences')
                .insert({
                    uuid: userUuid,
                    tool_preferences: toolPreferences
                })

            if (insertError) throw insertError

            // Mark stage 6 as completed
            const { error: stageError } = await supabase
                .from('user_onboarding_progress')
                .upsert({
                    uuid: userUuid,
                    stage_id: 6,
                    status: 'completed'
                }, {
                    onConflict: 'uuid,stage_id'
                })

            if (stageError) throw stageError

            toast.success('Tool preferences saved successfully!')
        } catch (error: any) {
            console.error('Error saving tool preferences:', error)
            toast.error(error.message || 'Failed to save tool preferences')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-4">
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[150px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    <Textarea
                        placeholder="Describe the tools, solutions, or services you're interested in purchasing..."
                        value={toolPreferences}
                        onChange={(e) => setToolPreferences(e.target.value)}
                        className="min-h-[150px]"
                    />
                    <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !toolPreferences.trim()}
                        className="w-full"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </>
            )}
        </div>
    )
} 