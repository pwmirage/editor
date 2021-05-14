<script id="tpl-page-branches" type="text/x-dot-template">
<div class="section">
<div class="mgContent">
	<div style="display: flex; flex-direction: column; row-gap: 5px; width: 300px;">
		{for branch of $branches}
			<a class="button" style="background: {@$page.branch_colors[$branch.id]};" href="/admin/branch/edit/?id={@$branch.id}">{@$branch.name}</a>
		{/for}
	</div>
</div>
</div>

{@@
<style>
.mgContent a.button:hover {
	color: black;
	position: relative;
	overflow: hidden;
}

.mgContent a.button:hover:after {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background: #000;
	opacity: 0.1;
}

.mgContent h2 {
	font-size: 15px;
	font-weight: bold;
}

</style>
@@}
</script>
