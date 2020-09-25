<script id="tpl-spawner" type="text/x-dot-template">

<div class="window resizable" style="width: 305px; height: 448px;">
<div class="header">
	<span>
		{if $spawner._db.type.startsWith("resources_")}Resource{/if}
		{if $spawner._db.type.startsWith("spawners")}{if $spawner.is_npc}NPC{else}Monster{/if}{/if}
		&nbsp;Spawner #{@$spawner.id}
	</span>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
		<span>Name</span>
		<input type="text" style="flex: 1; width: 100%; margin-bottom: 4px;" placeholder="(unnamed)" data-link="win.spawner => 'name'"></input>
	</div>
	<div class="flex-columns flex-all" style="align-items: center;">
		<a class="button" style="visibility:hidden; max-height: 0;">Pos:</a>
		<span>X:</span>
		<span>Y:</span>
		<span>Z:</span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 8px; align-items: center;">
		<a class="button">Pos:</a>
		<span>{@Math.floor($spawner.pos[0] * 100) / 100}</span>
		<span>{assign ypos = Math.floor($spawner.pos[1] * 100) / 100}{@$ypos}
			 {if $ypos == 0}&nbsp; (auto){/if}</span>
		<span>{@Math.floor($spawner.pos[2] * 100) / 100}</span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 8px; align-items: center;">
		<a class="button">Spread:</a>
		<span>{@Math.floor($spawner.spread[0] * 100) / 100}</span>
		<span>{assign ypos = Math.floor($spawner.spread[1] * 100) / 100}{@$ypos}
			 {if $ypos == 0}&nbsp; (auto){/if}</span>
		<span>{@Math.floor($spawner.spread[2] * 100) / 100}</span>
	</div>
	{if $spawner._db.type.startsWith('spawners_')}
		<label><input type="checkbox" data-oninput="win.set_is_npc(this.checked);" class="checkbox" {if $spawner.is_npc}checked{/if}><span>Is NPC</span></label>
	{/if}
	<div id="groups" class="flex-rows" style="margin-bottom: 8px;">
		{assign idx = 1}
		{foreach $spawner.groups as group}
			<div class="group-row flex-columns">
				{if $spawner._db.type.startsWith("resources_")}
					{assign obj = db.mines[$group.type]}
				{else}
					{assign obj = ($spawner.is_npc ? db.npcs : db.monsters)[$group.type]}
				{/if}
				<div>{@$idx}. {@($obj?.id ? (($obj?.name ?? "(unknown)") || "(unnamed)") : "(none)")}{if $group.type} <span style="font-size: 12px; vertical-align: bottom;">x{@$group.count || 0}</span>{/if} #{@$group.type}</div>
				<div style="flex: 1;"></div>
				{if $obj?.id}
					<a class="button no-break" style="margin-right: 5px;"><i class="fa fa-info"></i></a>
				{/if}
				<a class="button no-break"><i class="fa fa-angle-right"></i></a>
			</div>
			{$idx++}
		{/foreach}
	</div>
	<div class="flex-columns" style="margin-top: -7px; margin-bottom: 8px; align-items: center;">
		<div style="flex: 1;"></div>
		<a class="button no-break" data-onclick="win.add_group()">(add) &nbsp;<i class="fa fa-plus" aria-hidden="true"></i></a>
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
		<div class="no-break">Max groups:</div>
		<input type="number" style="flex: 1;" data-link="win.spawner => 'max_num'"></input>
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
		<div>Trigger:</div>
		<a class="button">(none) &nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
	</div>
	{if $spawner._db.type.startsWith('spawners_')}
		<div class="flex-columns" style="margin-bottom: 8px; align-items: center;">
			<div class="no-break">Lifetime: (sec) </div>
			<input type="number" style="flex: 1;" data-link="win.spawner => 'lifetime'"></input>
		</div>
	{/if}
</div>
</div>

TEMPLATE_END
<style>
.group-row {
	padding: 5px;
	background-color: #ececec;
	border: 1px solid #e0b0b0;
	align-items: center;
	margin-bottom: 2px;
}

</style>

</script>

