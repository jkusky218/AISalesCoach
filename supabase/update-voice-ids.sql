-- Update built-in scenarios to use free-tier ElevenLabs voices
update public.scenarios set voice_id = 'EXAVITQu4vr4xnSDxMaL' where persona = 'Jennifer Huang';  -- Sarah
update public.scenarios set voice_id = 'nPczCjzI2devNBz1zQrb' where persona = 'David Kowalski';  -- Brian
update public.scenarios set voice_id = 'JBFqnCBsd6RMkjVDRZzb' where persona = 'Robert Chen';     -- George
update public.scenarios set voice_id = 'XB0fDUnXU5powFXDhCwa' where persona = 'Maria Santos';    -- Charlotte
