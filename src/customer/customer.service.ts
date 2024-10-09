import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private readonly customerRepository: Repository<Customer>
  ) { };

  async create(createCustomerDto: CreateCustomerDto) {
    const customer = new Customer();
    customer.name = createCustomerDto.name;
    customer.address = createCustomerDto.address;
    customer.type = createCustomerDto.type;
    return this.customerRepository.save(customer);
  }

  async findAll(type: string | null): Promise<Customer[]> {
    return this.customerRepository.find({where: {type: type}});
  }

  async findOne(id: number): Promise<Customer | undefined> {
    const customer: Customer = await this.customerRepository.findOne({ where: { id: id } });
    if (customer) return customer;
    return undefined;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    if (customer) {
      await this.customerRepository.update(id, updateCustomerDto);
    }
    return this.customerRepository.findOne({ where: { id: id } });
  }

  async remove(id: number) {
    await this.customerRepository.delete({ id: id });
  }
}
