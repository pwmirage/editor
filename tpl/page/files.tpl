<script id="tpl-page-files" type="text/x-dot-template">
<div class="mgContent" style="min-height: 276px;">
	<div class="sides">
		<div class="left">
			<div>Latest:</div>
			<textarea>{@JSON.stringify($files, null, 2)}</textarea>
		</div>
		<div class="right">
			<div class="tabs" style="margin-bottom: 8px;">
				{assign idx = 0}
				{for branch of $branches}
					<div class="tab" onclick="{serialize $page}.select_tab({@$idx++});">{@$branch.name}</div>
				{/for}
			</div>
			<div class="tabcontents">
				{for branch of $branches}
					<div>
						<textarea>{@JSON.stringify(JSON.parse($branch.files), null, 2)}</textarea>
					</div>
				{/for}
			</div>
		</div>
	</div>

	<div style="display: flex; margin-top: 10px;">
		<div style="flex: 1;"></div>
		<a class="button buttonPrimary" href="javascript:void(0);" onclick="{serialize $page}.save();">Save</a>
	</div>
</div>

{@@
<style>
.mgContent {
	display: flex;
	flex-direction: column;
	row-gap: 4px;

}

.mgContent .sides {
	display: flex;
}

.mgContent .sides > * {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.mgContent textarea {
	overflow: hidden;
	min-height: 200px;
	min-width: 95%;
	max-width: 95%;
	height: 100%;
}

.mgContent .tabs {
	display: flex;
	border-bottom: 1px solid #e0b0b0;
	margin: 0 -6px;
	padding: 0 6px;
}

.mgContent .tabs > .tab {
	background-color: #dddddd;
	padding: 4px 10px;
	vertical-align: baseline;
	border: 1px solid #e0b0b0;
	margin-bottom: -1px;
	cursor: pointer;
}

.mgContent .tabs > .tab.active {
	background-color: #fafafa;
	border-bottom: 1px solid #fafafa;
}

.mgContent .tabcontents {
	overflow: hidden;
}

.mgContent .tabcontents > *:not(.active) {
	display: none;
}


</style>
@@}
</script>
