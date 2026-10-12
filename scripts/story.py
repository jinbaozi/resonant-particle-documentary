"""Validate an explicit theme plan before creating output; no default choreography."""
from pathlib import Path


def validate_story(story, base):
    if not story.get('scene_module') or not story.get('scenes'):
        raise ValueError('A theme needs scene_module and scenes; the Hepai animation is not a fallback.')
    module = (Path(base) / story['scene_module']).resolve()
    if not module.is_file():
        raise ValueError(f'Theme scene module not found: {module}')
    end = 0
    for scene in story['scenes']:
        for field in ['id', 'visual', 'action', 'meaning']:
            if not isinstance(scene.get(field), str) or not scene[field].strip():
                raise ValueError(f'Every scene needs {field}')
        if abs(scene['start'] - end) > 1e-6 or scene['end'] <= scene['start']:
            raise ValueError('Scenes must cover the main film continuously, starting at 0.')
        if not 0 < scene['morph'] <= scene['end'] - scene['start']:
            raise ValueError('Scene morph duration must fit its scene.')
        end = scene['end']
    if abs(end - 90) > 1e-6:
        raise ValueError('Scenes must end at main-film second 90.')
    if story.get('cover_scene') and story['cover_scene'] not in {s['id'] for s in story['scenes']}:
        raise ValueError('cover_scene must name a scene implemented by this story.')
    for label in story.get('diagram_labels', []):
        if not 0 <= label['start'] < label['end'] <= 90:
            raise ValueError('Diagram label timing must be within the main film.')
        if not 40 <= label['x'] <= 1880 or not 40 <= label['y'] <= 790:
            raise ValueError('Diagram labels must stay in the main picture area.')
    return module
