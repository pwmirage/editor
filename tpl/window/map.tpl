<script id="tpl-map-legend" type="text/x-dot-template">
<div class="window resizable" style="width: 305px; height: 448px;">
<div class="header">
	<span>Legend</span>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="margin-bottom: 8px;">
		<div class="v-centered">Search: </div>
		<input type="text" id="search" class="flex-wide" size='' autocomplete="off">
	</div>

	<div>
		<div class="collapsible" onclick="{serialize $win}.collapse(this);">
			<label><input type="checkbox" class="checkbox" id="npc-show" checked><span>Show NPCs  </span></label>
			<img src="/editor/img/spawner-npc.png" style="vertical-align: sub; width: 22px; margin-left: 42px;">
		</div>
		<div class="flex-rows child-padding-3">
			<div class="child-padding-3">
				<span style="vertical-align: text-bottom;">Spawned: </span>
				<label><input type="checkbox" class="checkbox" id="npc-show-auto" checked><span>Auto</span></label>
				<label><input type="checkbox" class="checkbox" id="npc-show-on-trigger" checked><span>On trigger</span></label>
			</div>
		</div>
	</div>

	<div>
		<div class="collapsible" onclick="{serialize $win}.collapse(this);">
			<label><input type="checkbox" class="checkbox" id="resource-show" checked><span>Show Resources  </span></label>
			<img src="/editor/img/spawner-resource.png" style="vertical-align: sub; width: 22px; margin-left: 9px;">
		</div>
		<div class="flex-rows child-padding-3">
			<div class="child-padding-3">
				<span style="vertical-align: text-bottom;">Spawned: </span>
				<label><input type="checkbox" class="checkbox" id="resource-show-auto" checked><span>Auto</span></label>
				<label><input type="checkbox" class="checkbox" id="resource-show-on-trigger" checked><span>On trigger</span></label>
			</div>
		</div>
	</div>

	<div>
		<div class="collapsible" onclick="{serialize $win}.collapse(this);">
			<label><input type="checkbox" class="checkbox" id="mob-show" checked><span>Show mobs </span></label>
			<img src="/editor/img/spawner-mob.png" style="vertical-align: sub; width: 22px; margin-left: 39px;">
		</div>
		<div>
			<table>
				<tr class="child-padding-3">
					<td><label><input type="checkbox" class="checkbox" id="mob-show-ground" checked><span>Ground</span></label></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-flying" checked><span>Flying</span></label></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-water" checked><span>Water</span></label></td>
				</tr>
				<tr class="child-padding-3">
					<td><span style="vertical-align: text-bottom;">Spawned: </span></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-auto" checked><span>Auto</span></label></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-on-trigger" checked><span>On trigger</span></label></td>
				</tr>
				<tr class="child-padding-3">
					<td><span style="vertical-align: text-bottom;">Boss: </span></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-boss" checked><span>Yes</span></label></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-nonboss" checked><span>No</span></label></td>
				</tr>
				<tr class="child-padding-3">
					<td><span style="vertical-align: text-bottom;">Aggressive: </span></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-aggressive" checked><span>Yes</span></label></td>
					<td><label><input type="checkbox" class="checkbox" id="mob-show-nonaggressive" checked><span>No</span></label></td>
				</tr>
				<tr class="child-padding-3">
					<td><span style="vertical-align: text-bottom;">Level: </span></td>
					<td colspan="2">
						<label><input type="number" class="supershort" id="mob-show-lvl-min" value="0"></label>
						<span> - </span>
						<label><input type="number" class="supershort" id="mob-show-lvl-max" value="150"></label>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<div style="flex: 1;"></div>
	<label style="margin-top: 4px;"><input type="checkbox" class="checkbox" id="show-real-bg"><span>Show real ingame terrain</span></label>
	<label style="margin-top: 4px;"><input type="checkbox" class="checkbox" id="show-name-labels"><span>Show name labels</span></label>
</div>
</div>

<style>
</style>

</script>
