<script id="tpl-spawner" type="text/x-dot-template">

<div class="window resizable" style="width: 305px; height: 448px;">
<div class="header">
	<span>Spawnersz #{@$spawner.id}</span>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="margin-bottom: 8px;">
		<div class="v-centered">Type:</div>
		<select id="type" style="width: 100%;">
			<option value="npc">NPC</option>
			<option value="resource">Resource</option>
			<option value="mob">Mob</option>
		</select>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 8px; align-items: center;">
		<a class="button">Pos:</a>
		<span>X: {@Math.floor($spawner.pos[0] * 100) / 100}</span>
		<span>Y: {assign ypos = Math.floor($spawner.pos[1] * 100) / 100}{@$ypos}
			 {if $ypos == 0}&nbsp; (auto){/if}</span>
		<span>Z: {@Math.floor($spawner.pos[2] * 100) / 100}</span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 8px; align-items: center;">
		<a class="button">Spread:</a>
		<span>X: {@Math.floor($spawner.spread[0] * 100) / 100}</span>
		<span>Y: {assign ypos = Math.floor($spawner.spread[1] * 100) / 100}{@$ypos}
			 {if $ypos == 0}&nbsp; (auto){/if}</span>
		<span>Z: {@Math.floor($spawner.spread[2] * 100) / 100}</span>
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
		<div>Trigger:</div>
		<a class="button">(none) &nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
	</div>
	{if $spawner._db.type.startsWith('spawners_') && !$spawner.is_npc}
		<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
			<div class="no-break">Lifetime: (sec) </div>
			<input type="number" style="flex: 1;" id="lifetime" value="{@$spawner.lifetime}"></input>
		</div>
	{/if}
</div>
</div>

<style>
</style>

</script>

