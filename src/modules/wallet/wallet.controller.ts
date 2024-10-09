import { Controller, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getAllWallet() : Promise<any> {
    return {
      success: true,
      message: "Wallet get successful",
      data: await this.walletService.getAllWallet()
    }
  }
}
