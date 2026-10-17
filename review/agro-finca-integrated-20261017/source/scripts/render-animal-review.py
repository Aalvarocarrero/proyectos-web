"""Render the exact exported Three buffers with Blender CPU, not WebGL QA."""
import bpy,json,sys,os,base64,math
from mathutils import Vector
folder=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else '/tmp/farm-animal-review'
for name in ['pig-before','pig-after','pig-fallback','cattle-before','cattle-after','cattle-fallback']:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for i,part in enumerate(json.load(open(f'{folder}/{name}.json'))):
  p=part['positions'];verts=[(p[j],-p[j+2],p[j+1]) for j in range(0,len(p),3)];ix=part['indices'] or list(range(len(verts)));faces=[ix[j:j+3] for j in range(0,len(ix),3)]
  mesh=bpy.data.meshes.new('review');mesh.from_pydata(verts,[],faces);mesh.update();obj=bpy.data.objects.new(part['name'] or 'surface',mesh);bpy.context.collection.objects.link(obj)
  for polygon in mesh.polygons:polygon.use_smooth=True
  if part['uv']:
   uv=mesh.uv_layers.new();a=part['uv']
   for loop in mesh.loops:uv.data[loop.index].uv=(a[loop.vertex_index*2],1-a[loop.vertex_index*2+1])
  mat=bpy.data.materials.new('surface');mat.use_nodes=True;bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Base Color'].default_value=(*part['color'],1);bsdf.inputs['Roughness'].default_value=part['roughness'];obj.data.materials.append(mat)
  if part.get('png'):
   path=f'{folder}/{name}-{i}.png';open(path,'wb').write(base64.b64decode(part['png']));texture=mat.node_tree.nodes.new('ShaderNodeTexImage');texture.image=bpy.data.images.load(path);mix=mat.node_tree.nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*part['color'],1);mat.node_tree.links.new(texture.outputs['Color'],mix.inputs[1]);mat.node_tree.links.new(mix.outputs[0],bsdf.inputs['Base Color'])
 bpy.ops.mesh.primitive_plane_add(size=200);ground=bpy.context.object;groundmat=bpy.data.materials.new('Ground');groundmat.diffuse_color=(.23,.27,.20,1);ground.data.materials.append(groundmat);ground.location.z=-.012
 bpy.ops.object.light_add(type='AREA',location=(0,-3,6));bpy.context.object.data.energy=450;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=4
 bpy.ops.object.camera_add(location=(3.0,-4.8,2.45));camera=bpy.context.object;target=Vector((0,0,.65));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=3.4;bpy.context.scene.camera=camera
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=20;scene.cycles.use_denoising=False;scene.world.color=(.35,.35,.35);scene.view_settings.view_transform='AgX';scene.render.resolution_x=800;scene.render.resolution_y=600;scene.render.resolution_percentage=100;scene.render.filepath=f'{folder}/{name}.png';bpy.ops.render.render(write_still=True)
