import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBillTable1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bill',
        columns: [
          {
            name: 'bill_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'bill_pdf',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'company_id',
            type: 'int',
          },
          {
            name: 'customer_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'created_by',
            type: 'int',
          },
          {
            name: 'created_on',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updated_on',
            type: 'timestamp',
            isNullable: true,
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'bill',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['company_id'],
        referencedTableName: 'company',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'bill',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedColumnNames: ['customer_id'],
        referencedTableName: 'customer',
        onDelete: 'SET NULL',
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('bill');
    const foreignKeys = table.foreignKeys;
    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey('bill', foreignKey);
    }
    await queryRunner.dropTable('bill');
  }
}

