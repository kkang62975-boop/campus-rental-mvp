import { supabase } from './supabaseClient'

export async function setPin(profileId, pin) {
  const { error } = await supabase.rpc('set_pin', { p_profile_id: profileId, p_pin: pin })
  if (error) throw error
}

export async function verifyPin(profileId, pin) {
  const { data, error } = await supabase.rpc('verify_pin', {
    p_profile_id: profileId,
    p_pin: pin,
  })
  if (error) throw error
  return data === true
}
