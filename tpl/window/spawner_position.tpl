<div class="window resizable" style="width: 300px; min-height: 100px; height: 170px;">
<div class="header">
	<span>
		<span>Change position of spawner <span class="id">&nbsp;{@DB.serialize_id($spawner.id)}</span></span>
	</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 2px;">
		<span style="visibility: hidden;">Previous Pos:</span>
		<span style="flex: 1;">X:</span>
		<span style="flex: 1;">Y:</span>
		<span style="flex: 1;">Z:</span>
	</div>
	<div class="flex-columns preview" style="align-items: center; margin-bottom: 2px;">
		<span>Previous Pos:</span>
		<span data-preview data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 0" data-placeholder="(0)"></span>
		<span data-preview data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 1" data-placeholder="(auto)"></span>
		<span data-preview data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 2" data-placeholder="(0)"></span>
	</div>
	<div class="flex-columns pos-input" style="align-items: center; margin-bottom: 5px;">
		<span style="margin-left: 30px;">Position:</span>

		<span data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 0" data-placeholder="(0)"></span>
		<span data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 1" data-placeholder="(auto)"></span>
		<span data-input class="input-number is_float" style="flex: 1;" data-link="{serialize $spawner} => 'pos', 2" data-placeholder="(0)"></span>
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
