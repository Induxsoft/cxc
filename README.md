Incluir las dependencias:
 - Bootstrap 5
 - induxsoft.controls.js
 - induxsoft.controls.editable.js

Incluir las siguientes lineas en routes.map (crear si no existe) ubicado dentro de _protected

 - *: /cxc/{_program}/{_entity_id}/{_view}/ > /cxc/entry-point.dkl
 - *: /cxc/{_program}/{_entity_id?} > /cxc/entry-point.dkl
 - *: /cxc/ > /cxc/index.dkl

Colocar al final solo si aun no se cuenta con el map: `*: / > /webshell/index.dkl`