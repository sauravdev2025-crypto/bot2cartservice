export class BroadcastMessagePayloadDto {
  id: number;
  mobile: string;
  dialing_code: string;
  variables: {
    key: string;
    value: string;
  }[];
}
