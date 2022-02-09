<div class="window resizable" style="width: 300px; min-height: 100px; height: 170px;">
<div class="header">
	<span>
		<span>Change rotation of spawner <span class="id">&nbsp;{@DB.serialize_id($spawner.id)}</span></span>
	</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns preview" style="align-items: center; margin-bottom: 2px;">
		<span>Previous Dir:</span>
		<span style="flex: 1;">{@Math.round(Math.atan2($spawner.dir[2], $spawner.dir[0]) * 10000) / 10000}</span>
	</div>
	<div class="flex-columns pos-input" style="align-items: center; margin-bottom: 8px;">
		<span>Dir (radians):</span>

		<input id="input" type="number" style="flex: 1;" value="{@Math.round(Math.atan2($spawner.dir[2], $spawner.dir[0]) * 10000) / 10000}">
	</div>
	<div style="display: flex; margin-right: 10px; column-gap: 8px;">
		<div style="flex: 1"></div>
		<a class="button" onclick="{serialize $win}.close()">Return</a>
	</div>
</div>
</div>

{@@
<style>
.preview > * {
	display: inline-block;
}
</style>
@@}
