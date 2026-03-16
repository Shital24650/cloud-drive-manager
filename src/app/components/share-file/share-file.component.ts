import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-share-file',
  template: 
    <div style="text-align:center;margin-top:40px">

<h2>Shared File</h2>

<a *ngIf="fileUrl" [href]="fileUrl" target="_blank">
Download / View File
</a>

</div>
})
export class ShareFileComponent implements OnInit {

  fileUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private storage: StorageService
  ) {}

  ngOnInit() {

    const fileId = this.route.snapshot.paramMap.get('id');

    if(fileId){
      const { data } = this.storage.supabase
        .storage
        .from('drive-files')
        .getPublicUrl(fileId);

      this.fileUrl = data.publicUrl;
    }
  }
}
