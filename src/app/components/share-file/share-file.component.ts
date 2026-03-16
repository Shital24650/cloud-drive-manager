import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
selector: 'app-share-file',
template: `
<div style="padding:40px;text-align:center">

<h2>Shared File</h2>

<p>File ID: {{fileId}}</p>

<p>Here you can load file preview or download.</p>

</div>
`
})
export class ShareFileComponent{

fileId:string | null = null;

constructor(private route:ActivatedRoute){

this.fileId = this.route.snapshot.paramMap.get("id");

}

}