import {Injectable} from '@nestjs/common';
import {VoilaNorbertService} from './voila-norbert/volia-norbert.service';
import {ProxycurlService} from './proxycurl/proxycurl.service';
import {PeopledatalabsService} from './peopledatalabs/peopledatalabs.service';
export * from './constants';

@Injectable()
export class PeopleFinderService {
  constructor(
    public readonly voilaNorbert: VoilaNorbertService,
    public readonly proxycurl: ProxycurlService,
    public readonly peopledatalabs: PeopledatalabsService
  ) {}
}
