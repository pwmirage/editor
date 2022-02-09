<div class="window resizable" style="width: 300px;">
<div class="header {if $spawner._removed}removed{/if}">
	<span>
		<span class="name">
			{if $spawner.type == 'resource'}Resource
			{else if $spawner.type == 'npc'}NPC
			{else}Monster{/if}
			&nbsp;Spawner 
		</span> <span class="id">&nbsp;{@DB.serialize_id($spawner.id)}</span>
	</span>
	<div class="menu">
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns flex-all" style="align-items: center;">
		<a class="button" style="visibility:hidden; max-height: 0;" onclick="">Pos:</a>
		<span>X:</span>
		<span>Y:</span>
		<span>Z:</span>
	</div>
	<div id="position" class="flex-columns flex-all" style="margin-bottom: 5px; align-items: center;">
		<a class="button" onclick="{serialize $win}.pos_onclick(this, event);" oncontextmenu="event.preventDefault(); this.onclick(event);">Pos:</a>
		<span>{@Math.floor($spawner.pos[0] * 100) / 100}</span>
		<span>{assign ypos = Math.floor($spawner.pos[1] * 100) / 100}{@$ypos}
			 {if $ypos == 0}&nbsp; (auto){/if}</span>
		<span>{@Math.floor($spawner.pos[2] * 100) / 100}</span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 5px; align-items: center;">
		<a class="button" onclick="MessageWindow.open({@@{ msg: 'Not implemented yet' }@@})" oncontextmenu="event.preventDefault(); this.onclick(event);">Spread:</a>
		<span>{@Math.floor($spawner.spread[0] * 100) / 100}</span>
		<span>{@Math.floor($spawner.spread[1] * 100) / 100}</span>
		<span>{@Math.floor($spawner.spread[2] * 100) / 100}</span>
	</div>
	{if $spawner.type != 'resource'}
		<div id="rotation" class="flex-columns flex-all" style="margin-bottom: 5px; align-items: center;">
			<a class="button" onclick="{serialize $win}.dir_onclick(this, event);" oncontextmenu="event.preventDefault(); this.onclick(event);">Direction:</a>
			<span style="white-space: pre;">{@Math.round(Math.atan2($spawner.dir[2], $spawner.dir[0]) * 10000) / 10000} rad</span>
			<span></span>
			<span></span>
		</div>
	{/if}
	<div id="groups" class="flex-rows" style="margin-bottom: 5px;">
		{assign idx = 0}
		{foreach group of ($spawner.groups || [])}
			{if $spawner.type == 'resource'}
				{assign obj = db.mines[$group.type]}
			{else}
				{assign obj = db.npcs[$group.type] || db.monsters[$group.type]}
			{/if}
			<div class="group-row flex-columns">
				<div>{@$idx + 1}. {@($obj?.id ? (($obj?.name ?? "(unknown)") || "(unnamed)") : "(none)")}{if $group.type && $spawner.type != 'npc'} <span style="font-size: 12px; vertical-align: bottom;">x{@$group.count || 0}</span>{/if} {@DB.serialize_id($group.type)}</div>
				<div style="flex: 1;"></div>
				<a class="button no-break menu-triangle" onmousedown="{serialize $win}.open_group(this, {@$idx}, event);" oncontextmenu="event.preventDefault();" style="width: 13px; text-align: center;"><i class="fa fa-pencil-square-o"></i></a>
				<a class="group-hover button no-break" onmouseenter="{serialize $win}.info_group(this, {@$idx});" onclick="{serialize $win}.select_group(this.parentNode); event.stopPropagation();" style="margin-right: -10px;"><i class="fa fa-asterisk"></i></a>
			</div>
			{$idx++}
		{/foreach}
	</div>
	{if $spawner.type != 'npc'}
		<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
			<div style="flex: 1;"></div>
			<a class="button no-break" onclick="{serialize $win}.add_group()">(add) &nbsp;<i class="fa fa-plus" aria-hidden="true"></i></a>
		</div>
		<div class="flex-columns flex-all">
			<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
				<div class="no-break">Max groups:</div>
				<input type="number" style="flex: 1; max-width: 40px;" data-link="{serialize $win.spawner} => 'max_num'">
			</div>
			<div></div>
			<label><input type="checkbox" data-link="{serialize $spawner} => 'auto_respawn'" class="checkbox"><span class="no-break">Auto Respawn</span></label>
		</div>
	{/if}
	<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
		<div>Trigger:</div>
		<a class="button menu-triangle" data-link-button="{serialize $win.spawner} => 'trigger'" data-select="db.{@$win.spawner._db.type.replace('spawners_', 'triggers_')}" style="margin-top: 1px; margin-bottom: 1px;"></a>
	</div>
	{if $spawner.type != 'npc'}
		<div class="flex-columns" style="margin-bottom: 5px; align-items: center;">
			<div class="no-break">Lifetime: (sec) </div>
			<input type="number" style="flex: 1;" data-link="{serialize $win.spawner} => 'lifetime'">
		</div>
	{/if}
	{if $spawner.type == 'npc'}
		<div id="npc-group" style="min-height: 42px; flex: 1; display: flex; flex-direction: column; margin: 0 -12px;">
			{assign npc = db.npcs[$spawner.groups[0]?.type || 0]}
			{if !$npc}
				<div class="header"><span>-</span></div>
			{/if}
			<div id="npc-window" style="flex:1;"></div>
		</div>
	{/if}
</div>
</div>

{@@
<style>
.group-row {
	padding: 5px;
	background-color: #ececec;
	border: 1px solid #e0b0b0;
	align-items: center;
	margin-bottom: -1px;
	position: relative;
	box-sizing: border-box;
}

.group-row.selected:after {
	opacity: 0.175;
}

.group-row > .group-hover {
	height: 20px;
}

.group-row > .group-hover > .window {
	display: none;
	position: relative;
	border-left: none;
	align-self: start;
	top: -48px;
	right: -20px;
	width: 0;
}

.group-row.selected > .group-hover > .window,
#groups:not(.has-selected) > .group-row > .group-hover:hover > .window {
	z-index: 0 !important;
	display: block;
	margin-left: -1px;
}

</style>
@@}
